import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import path = require('path');

export class MyResourceStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        
        const lambda1 = new lambda.Function(this, 'LambdaFunction1', {
            code: lambda.Code.fromAsset(path.resolve(__dirname, "Lambda_Handlers")),
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "lambda1.handler",
            timeout: cdk.Duration.seconds(3)
        });

        // SQS Queue Definition
        const queueForLambdaFunction1 = new sqs.Queue(this, 'MyQueueForLambdaFunction1');
        const eventSourceForLambdaFunction1 = new lambdaEventSources.SqsEventSource(queueForLambdaFunction1);

        lambda1.addEventSource(eventSourceForLambdaFunction1);

        const lambda2 = new lambda.Function(this, 'LambdaFunction2', {
            code: lambda.Code.fromAsset(path.resolve(__dirname, "Lambda_Handlers")),
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "lambda2.handler",
            timeout: cdk.Duration.seconds(3)
        });

        // Define an API Gateway
        const apiForLambdaFunction2 = new apigateway.RestApi(this, 'MyAPIGatewayForLambdaFunction2', {
            restApiName: 'API with lambda: LambdaFunction2',
            description: 'This is an example API for LambdaFunction2',
        });
    
        // Define a resource (root of the API)
        const resourceForLambdaFunction2 = apiForLambdaFunction2.root.addResource('myresource');
    
        // Define a method (e.g., GET) on the resource
        const methodForLambdaFunction2 = resourceForLambdaFunction2.addMethod('GET', new apigateway.LambdaIntegration(lambda2));
    
        // Output the API endpoint URL
        new cdk.CfnOutput(this, 'ApiEndpoint', {
            value: apiForLambdaFunction2.url,
        });

        const lambda3 = new lambda.Function(this, 'LambdaFunction3', {
            code: lambda.Code.fromAsset(path.resolve(__dirname, "Lambda_Handlers")),
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "lambda3.handler",
            timeout: cdk.Duration.seconds(3)
        });

        // Shell Step Function Definition
        const stateMachineForLambdaFunction3 = new sfn.StateMachine(this, 'MyStateMachineForLambdaFunction3', {
            definition: new tasks.LambdaInvoke(this, "TaskForLambdaFunction3", {
                lambdaFunction: lambda3
            }).next(new sfn.Succeed(this, "HelloWorld"))
        });

        const lambda4 = new lambda.Function(this, 'LambdaFunction4', {
            code: lambda.Code.fromAsset(path.resolve(__dirname, "Lambda_Handlers")),
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "lambda4.handler",
            timeout: cdk.Duration.seconds(3)
        });
    }
}