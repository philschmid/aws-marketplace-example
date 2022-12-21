import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SubscribeConstructeWithLambda } from './subscribeSnsTopicQueue';
import { RestApi, LambdaIntegration, Cors } from 'aws-cdk-lib/aws-apigateway';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as path from 'path';
import { Code, Runtime, Function } from 'aws-cdk-lib/aws-lambda';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';


export interface MarketplaceStackProps extends cdk.StackProps {
  readonly name: string;
  readonly marketplaceSnsTopic: string;
  readonly productCode: string;
}


export class MarketplaceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MarketplaceStackProps) {
    super(scope, id, props);

    // create SNS Subscribe Pipeline
    const subscribeConstructeWithLambda = new SubscribeConstructeWithLambda(this, 'SubscribeConstructeWithLambda', {
      name: props.name,
      marketplaceSnsTopic: props.marketplaceSnsTopic
    });

    //  
    // LAMBDA FUNCTIONS
    // 

    // Not longer needed is integrated into the NextJS app    // // Lambda function to resolve POST Request coming from Marketplace
    // const resolveCustomerLambda = new PythonFunction(this, 'resolveCustomer', {
    //   entry: path.resolve(__dirname, '..', 'api'), // required
    //   runtime: Runtime.PYTHON_3_8, // required
    //   index: 'resolve_customer.py', // optional, defaults to 'index.py'
    // });
    // // Add Policy to Lambda to allow it to resolve customer
    // // https://docs.aws.amazon.com/marketplace/latest/userguide/iam-user-policy-for-aws-marketplace-actions.html
    // const resolveCustomerPolicy = new PolicyStatement({
    //   actions: ["aws-marketplace:ResolveCustomer"],
    //   resources: ["*"],
    // });
    // resolveCustomerLambda.role?.attachInlinePolicy(new Policy(this, 'resolveCustomerPolicy', {
    //   statements: [resolveCustomerPolicy],
    // }),
    // )

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
    // TODO: add permission to read from DynamoDB table

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



