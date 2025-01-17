// service.js - Sample DynamoDB service file for interacting with the database
// Not Fully Implemented as it would required an AWS API Key and Secret Key

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = ""

const dynamoDBClient = new DynamoDBClient({ region: process.env.region });
const dynamoDB = DynamoDBDocumentClient.from(dynamoDBClient);

// Sample Module
// Not Fully Implemented as it would required an AWS API Key and Secret Key

/*
  * Get all items from the database  
*/
const getItems = async () => {
    const params = {
        TableName: TABLE_NAME
    };

    const command = new ScanCommand(params);
    const response = await dynamoDB.send(command);
    return response.Items;
};

/*
    * Get a single item from the database
*/
const getItem = async (id) => {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            id: id
        }
    };

    const command = new GetCommand(params);
    const response = await dynamoDB.send(command);
    return response.Item;
}

/*
    * Put an item into the database
*/
const putItem = async (item) => {
    const params = {
        TableName: TABLE_NAME,
        Item: {
            id: uuidv4(),
            ...item
        }
    };

    const command = new PutCommand(params);
    const response = await dynamoDB.send(command);
    return response;
}

// Ect...

module.exports = {
    getItems,
    getItem,
    putItem
};