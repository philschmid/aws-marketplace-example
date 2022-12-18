import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import { CfnOutput, SecretValue } from 'aws-cdk-lib';
import * as cr from 'aws-cdk-lib/custom-resources'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as iam from 'aws-cdk-lib/aws-iam'
import { CfnBranch } from 'aws-cdk-lib/aws-amplify'



export interface AmplifyNextJsStackProps extends cdk.StackProps {
  readonly name: string;
  readonly githubRepsoitory: string;
  readonly githubToken: string;
  readonly environmentVariables: { [key: string]: string };
  readonly customDomain?: string,
}


export class AmplifyNextJsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AmplifyNextJsStackProps) {
    super(scope, id, props);

    // Create IAM role for amplify with needed permissions to create the resoruces
    // https://github.com/aws-amplify/amplify-hosting/blob/main/FAQ.md#error-accessdenied-access-denied

    // User Table
    const userTable = new dynamodb.Table(this, `NextAuthTable`, {
      tableName: `${props.name}-user-table`,
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: "expires",
    })
    const gsiName = "GSI1"
    userTable.addGlobalSecondaryIndex({
      indexName: gsiName,
      partitionKey: { name: "GSI1PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "GSI1SK", type: dynamodb.AttributeType.STRING },
    })

    // Endpoint Table
    const endpointTable = new dynamodb.Table(this, `EndpointTable`, {
      tableName: `${props.name}-endpoint-table`,
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "endpointName", type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: "expires",
    })

    // create iam role for amplify
    const role = new iam.Role(this, 'AmplifyRole', {
      assumedBy: new iam.ServicePrincipal('amplify.amazonaws.com'),
    });
    // add permissions to write logs
    role.addToPolicy(new iam.PolicyStatement({
      actions: ['logs:CreateLogStream', 'logs:CreateLogGroup', 'logs:DescribeLogGroups', 'logs:PutLogEvents'],
      resources: ['*'],
    }));
    // create iam user for amplify credentials since you cannot assign a role to it
    // https://github.com/aws-amplify/amplify-hosting/issues/3205
    const amplifyUser = new iam.User(this, 'AmplifyUser')
    // add permissions to create users in table
    userTable.grantReadWriteData(amplifyUser)
    endpointTable.grantReadWriteData(amplifyUser)
    amplifyUser.addToPolicy(new iam.PolicyStatement({
      actions: ["aws-marketplace:ResolveCustomer"],
      resources: ["*"],
    }))
    const accessKey = new iam.AccessKey(this, 'AccessKey', { user: amplifyUser });
    const secretValue = accessKey.secretAccessKey.unsafeUnwrap()


    // Default environment variables
    const environmentVariables = {
      "AMPLIFY_MONOREPO_APP_ROOT": "app",
      "AMPLIFY_DIFF_DEPLOY": "false",
      "NEXT_AUTH_DYNAMODB_TABLE": userTable.tableName,
      "NEXT_AUTH_DYNAMODB_GSI_NAME": gsiName,
      "NEXT_AUTH_AWS_ACCESS_KEY_ID": accessKey.accessKeyId.toString(),
      "NEXT_AUTH_AWS_SECRET_ACCESS_KEY": secretValue,
      "NEXT_AUTH_AWS_REGION": this.region,
      "NEXT_ENDPOINT_DYNAMODB_TABLE": endpointTable.tableName,
    }

    // create amplify app
    const amplifyApp = new amplify.App(this, 'NextJsApp', {
      appName: props.name,
      role,
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: props.githubRepsoitory.split("/")[0],
        repository: props.githubRepsoitory.split("/")[1],
        oauthToken: SecretValue.unsafePlainText(props.githubToken),
      }),
      autoBranchDeletion: true,
      environmentVariables,
      customRules: [
        {
          source: '/<*>',
          target: '	/index.html',
          status: amplify.RedirectStatus.NOT_FOUND_REWRITE,
        },
      ],
      // PR preview enabled -> this will create a preview for every pull request no branch detection
      // autoBranchCreation: { // Automatically connect branches that match a pattern set
      //   patterns: ['feature/*', 'test/*'],
      // },
      // autoBranchDeletion: true, // Automatically disconnect a branch when you delete a branch from your repository
      buildSpec: codebuild.BuildSpec.fromObjectToYaml({
        version: '1.0',
        // needed for monorepo structure
        // https://docs.aws.amazon.com/amplify/latest/userguide/monorepo-configuration.html
        applications: [
          {
            appRoot: 'app',
            frontend: {
              phases: {
                preBuild: {
                  commands: ['npm ci'],
                },
                build: {
                  commands: [
                    // https://docs.aws.amazon.com/amplify/latest/userguide/ssr-environment-variables.html
                    `env | grep ${Object.keys(props.environmentVariables).map(key => "-e " + key).join(" ")} >> .env.production`,
                    `env | grep -e NEXT_AUTH_ >> .env.production`,
                    props.customDomain ? `echo "NEXTAUTH_URL=${props.customDomain}"  >> .env.production` : 'echo "NEXTAUTH_URL=https://${AWS_BRANCH}.${AWS_APP_ID}.amplifyapp.com" >> .env.production',
                    "env",
                    "cat .env.production",
                    'npm run build',
                  ],
                },
              },
              artifacts: {
                baseDirectory: '.next',
                files: ['**/*'],
              },
              cache: {
                paths: ["node_modules/**/*", ".next/cache/**/*"]
              },
            },
          }
        ]
      }),
    });


    // add branch and environment variables
    const main = amplifyApp.addBranch('main', {
      stage: 'PRODUCTION',
      // performanceMode: true, 
      pullRequestPreview: true,
      autoBuild: true,
    }); // `id` will be used as repo branch name
    // iterate over environment variables object and add them to the app
    Object.keys(props.environmentVariables).forEach((key) => {
      main.addEnvironment(key, props.environmentVariables[key]);
    });

    // add framework manually because it is not yet supported by the Amplify CDK
    // https://github.com/aws/aws-cdk/issues/23325
    const cfnBranch = main.node.defaultChild as CfnBranch
    cfnBranch.addOverride('Properties.Framework', 'Next.js - SSR');
    // cfnBranch.addDeletionOverride('Properties.BranchName');

    // update platform to WEB_COMPUTE because it is not yet supported by the Amplify CDK
    // https://aws.amazon.com/de/blogs/mobile/deploy-a-nextjs-13-application-to-amplify-with-the-aws-cdk/
    const updatePlatform = new cr.AwsCustomResource(this, 'updatePlatform', {
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE
      }),
      onCreate: {
        service: 'Amplify',
        action: 'updateApp',
        physicalResourceId: cr.PhysicalResourceId.of('app-update-platform'),
        parameters: {
          appId: amplifyApp.appId,
          platform: 'WEB_COMPUTE',
        },
        outputPaths: [] // https://github.com/aws/aws-cdk/issues/2825
      },
    });

    // add domain 
    if (props.customDomain) {
      const domain = amplifyApp.addDomain(props.customDomain, {
        enableAutoSubdomain: true, // in case subdomains should be auto registered for branches
        autoSubdomainCreationPatterns: ['*', 'pr*'], // regex for branches that should auto register subdomains
      });
      domain.mapRoot(main); // map main branch to domain root
      domain.mapSubDomain(main, 'www');
      // domain.mapSubDomain(dev); // sub domain prefix defaults to branch name
    }

    // Outpus
    new CfnOutput(this, 'appId', {
      value: amplifyApp.appId,
    })
    new CfnOutput(this, 'appDomain', {
      value: props.customDomain ? props.customDomain : `https://${main.branchName}.${amplifyApp.appId}.amplifyapp.com`
    })
  }
}



