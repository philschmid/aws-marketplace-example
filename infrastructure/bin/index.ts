#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MarketplaceStack, MarketplaceStackProps } from '../lib/marketplaceStack';
import { AmplifyNextJsStack, AmplifyNextJsStackProps } from '../lib/amplifyNextJsStack';
import config from '../config'
import { MarketplacePublisherStack } from '../lib/marketplacePublisherStack';

const props: MarketplaceStackProps = {
  name: 'marketplace-test',
  marketplaceSnsTopic: 'arn:aws:sns:us-east-1:123456789012:MarketplaceTopic',
  productCode: '123456789012'
}

// You can use AWS CloudFormation, the Amplify CLI, and the SDKs to deploy a new Amplify app
//  that uses the GitHub App for repo access. This process requires that you first install
// the Amplify GitHub App in your GitHub account. https://docs.aws.amazon.com/amplify/latest/userguide/setting-up-GitHub-access.html#setting-up-github-app-cloudformation
// Next, you will need to generate a personal access token in your GitHub account. 
// Lastly, deploy the app and specify the personal access token.
const amplifyProps: AmplifyNextJsStackProps = {
  name: props.name,
  githubRepsoitory: 'philschmid/aws-marketplace-example',
  githubToken: config.GITHUB_ACCESS_TOKEN,
  // customDomain: 'master.d3q7q2q2q2q2q2.amplifyapp.com',
  environmentVariables: {
    NEXTAUTH_SECRET: config.NEXTAUTH_SECRET,
    GITHUB_ID: config.GITHUB_ID,
    GITHUB_SECRET: config.GITHUB_SECRET,
  }
}


const app = new cdk.App();

// give permission from the Marketplace account to the hosting account
new MarketplacePublisherStack(app, 'MarketplacePublisherStack', {
  saasHostingAccountId: 'account id 2',
  marketplaceSnsTopicArn: props.marketplaceSnsTopic,
})

// deploy marketplace related Lambda Functions and resources (SQS, SNS, etc)
new MarketplaceStack(app, 'MarketplaceStack', {
  ...props,
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

// deploy NextJS Application with Amplify from GitHub
new AmplifyNextJsStack(app, 'AmplifyNextJsStack', {
  ...amplifyProps,
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

