import axios from 'axios';
import base64 from 'react-native-base64';
import {JIRA_API_URL, AUTH_EMAIL, AUTH_TOKEN} from '../ config';

const authHeader = 'Basic ' + base64.encode(`${AUTH_EMAIL}:${AUTH_TOKEN}`);

export const getProjects = async () => {
  try {
    const response = await axios.get(`${JIRA_API_URL}/project`, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const authenticate = async () => {
  try {
    const response = await axios.get(`${JIRA_API_URL}/myself`, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Authentication failed:', error);
    return null;
  }
};

export const getIssuesForProject = async projectId => {
  try {
    const response = await axios.get(
      `${JIRA_API_URL}/search?jql=project=${projectId}`,
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.issues;
  } catch (error) {
    console.error('Error fetching issues:', error);
    return [];
  }
};

export const getComments = async issueId => {
  try {
    const response = await axios.get(
      `${JIRA_API_URL}/issue/${issueId}/comment`,
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

export const addComment = async (issueId, commentText) => {
  try {
    const response = await axios.post(
      `${JIRA_API_URL}/issue/${issueId}/comment`,
      {
        body: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [{type: 'text', text: commentText}],
            },
          ],
        },
      },
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
};
