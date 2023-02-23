#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MarketplaceStack, MarketplaceStackProps } from '../lib/marketplaceStack';
import { AmplifyNextJsStack, AmplifyNextJsStackProps } from '../lib/amplifyNextJsStack';
import config from '../config'

const props = { name: 'marketplace-test' }

const app = new cdk.App();
// You can use AWS CloudFormation, the Amplify CLI, and the SDKs to deploy a new Amplify app
//  that uses the GitHub App for repo access. This process requires that you first install
// the Amplify GitHub App in your GitHub account. https://docs.aws.amazon.com/amplify/latest/userguide/setting-up-GitHub-access.html#setting-up-github-app-cloudformation
// Next, you will need to generate a personal access token in your GitHub account. 
// Lastly, deploy the app and specify the personal access token.
const amplifyProps: AmplifyNextJsStackProps = {
  name: props.name,
  crossAccountId: config.AWS_MARKETPLACE_PROVIDER_ACCOUNTID,
  githubRepsoitory: 'philschmid/aws-marketplace-example',
  githubToken: config.GITHUB_ACCESS_TOKEN,
  // customDomain: 'master.d3q7q2q2q2q2q2.amplifyapp.com',
  environmentVariables: {
    NEXTAUTH_SECRET: config.NEXTAUTH_SECRET,
    GITHUB_ID: config.GITHUB_ID,
    GITHUB_SECRET: config.GITHUB_SECRET,
  }
}



// deploy NextJS Application with Amplify from GitHub
// AWS_PROFILE=hf-sm AWS_DEFAULT_REGION=us-east-1 cdk deploy
const providerStack = new AmplifyNextJsStack(app, 'AmplifyNextJsStack', {
  ...amplifyProps,
  env: { account: config.AWS_HOSTING_ACCOUNTID, region: process.env.CDK_DEFAULT_REGION },
});

// give permission from the Marketplace account to the deploy account
// AWS_PROFILE must be the for the marketpalce credentials
/* AWS_PROFILE=hf-marketplace \ 
AWS_DEFAULT_REGION=us-east-1 \
DEPLOY_ACCOUNT=558105141721 \
MARKETPLACE_ACCOUNT=907797767998 \
cdk bootstrap --trust ${DEPLOY_ACCOUNT} --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess aws://${MARKETPLACE_ACCOUNT}/us-east-1
*/

const marketplaceProps: MarketplaceStackProps = {
  name: props.name,
  marketplaceSnsTopic: 'arn:aws:sns:us-east-1:287250355862:aws-mp-subscription-notification-2qmywxoiv58nm308h0zrd2q0k',
  productCode: '2qmywxoiv58nm308h0zrd2q0k',
  crossAccountTableRole: providerStack.crossAccountTableRole,
  crossAccoountTable: providerStack.table,
}


// deploy marketplace related Lambda Functions and resources (SQS, SNS, etc)
new MarketplaceStack(app, 'MarketplaceStack', {
  ...marketplaceProps,
  env: { account: config.AWS_MARKETPLACE_PROVIDER_ACCOUNTID, region: process.env.CDK_DEFAULT_REGION },
});


