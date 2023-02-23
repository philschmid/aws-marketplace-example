import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SubscribeConstructeWithLambda } from './subscribeSnsTopicQueue';
import { RestApi, LambdaIntegration, Cors } from 'aws-cdk-lib/aws-apigateway';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam'
import { Code, Runtime, Function } from 'aws-cdk-lib/aws-lambda';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'

export interface MarketplaceStackProps extends cdk.StackProps {
  readonly name: string;
  readonly marketplaceSnsTopic: string;
  readonly productCode: string;
  readonly crossAccountTableRole: iam.Role;
  readonly crossAccoountTable: dynamodb.Table;
}


export class MarketplaceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MarketplaceStackProps) {
    super(scope, id, props);

    // create SNS Subscribe Pipeline
    const subscribeConstructeWithLambda = new SubscribeConstructeWithLambda(this, 'SubscribeConstructeWithLambda', {
      name: props.name,
      marketplaceSnsTopic: props.marketplaceSnsTopic,
      crossAccountDynamodbRole: props.crossAccountTableRole,
      crossAccoountTable: props.crossAccoountTable
    });

    // configure access from provider account to marketplace account to consume provider iam roles for cross account access


    // Lambda function to send usage to the Marketplace
    const trackUsageLambda = new Function(this, 'trackUsage', {
      code: Code.fromAsset(path.resolve(__dirname, '..', '..', 'api')), // required
      runtime: Runtime.PYTHON_3_8, // required
      handler: 'track_usage.handler', // optional, defaults to 'handler'
      environment: {
        'PRODUCT_CODE': props.productCode
      }
    });

    // Add Policy to Lambda to allow it to resolve customer
    // https://docs.aws.amazon.com/marketplace/latest/userguide/iam-user-policy-for-aws-marketplace-actions.html
    const trackUsageLambdaPolicy = new PolicyStatement({
      actions: ["aws-marketplace:BatchMeterUsage"],
      resources: ["*"],
    });
    trackUsageLambda.role?.attachInlinePolicy(new Policy(this, 'trackUsagePolicy', {
      statements: [trackUsageLambdaPolicy],
    }),
    )
    trackUsageLambda.addToRolePolicy(new iam.PolicyStatement({
      resources: [props.crossAccountTableRole.roleArn],
      actions: ['sts:AssumeRole']
    }));

    //  
    // API Gateway
    // 

    // Create an API Gateway resource for each of the CRUD operations
    const api = new RestApi(this, 'marketplace', {
      restApiName: 'Marketplace API',

    });
    const marketplaceRoutes = api.root.addResource('marketplace');
    // add /track routes for lambda with CORS
    const trackUsage = marketplaceRoutes.addResource('track');
    trackUsage.addCorsPreflight({ allowOrigins: ["*"], allowMethods: ["POST"], allowHeaders: ["*"], allowCredentials: true });
    trackUsage.addMethod('POST', new LambdaIntegration(trackUsageLambda));
  }
}



