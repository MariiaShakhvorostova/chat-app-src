/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  getProjects,
  getIssuesForProject,
  getComments,
  addComment,
} from '../api/api';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Linking,
} from 'react-native';

export default function ChatScreen({route}) {
  const {displayName, selfLink} = route.params;
  const [projects, setProjects] = useState([]);
  const [projectComments, setProjectComments] = useState({});
  const [newComments, setNewComments] = useState({});

  const getBaseLink = link => {
    const endIndex = link.indexOf('.net');
    if (endIndex !== -1) {
      return link.substring(0, endIndex + 4);
    }
    return link;
  };

  const baseLink = getBaseLink(selfLink);

  const loadProjectsAndComments = async () => {
    try {
      const projectList = await getProjects();
      setProjects(projectList);
      console.log('Projects:', projectList);

      const updatedProjectComments = {};
      for (const project of projectList) {
        const issues = await getIssuesForProject(project.id);
        console.log(`Issues for project ${project.name}:`, issues);

        updatedProjectComments[project.id] = {};
        for (const issue of issues) {
          const issueComments = await getComments(issue.id);
          console.log(
            `Comments for issue ${issue.fields.summary}:`,
            issueComments,
          );

          updatedProjectComments[project.id][issue.id] = {
            cardName: issue.fields.summary,
            comments: issueComments.map(comment => ({
              authorName: comment.author.displayName,
              body: comment.body.content[0]?.content[0]?.text || '',
              jiraLink: `${baseLink}/browse/${issue.key}`,

              imageUrl: getImageUrl(comment.body.content),
            })),
          };
        }
      }
      setProjectComments(updatedProjectComments);
    } catch (error) {
      console.error('Error loading projects and comments:', error);
    }
  };

  const getImageUrl = content => {
    const mediaContent = content.find(item => item.type === 'mediaSingle');
    if (mediaContent) {
      const fileContent = mediaContent.content.find(
        item => item.attrs?.type === 'file',
      );
      if (fileContent) {
        const imageId = fileContent.attrs.id;
        const imageUrl = `${baseLink}/secure/attachment/${imageId}`;
        console.log('Image URL:', imageUrl);
        return imageUrl;
      }
    }
    console.log('No image URL found in content');
    return null;
  };

  useEffect(() => {
    loadProjectsAndComments();

    const intervalId = setInterval(() => {
      loadProjectsAndComments();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const handleAddComment = async (issueId, projectId) => {
    const newComment = newComments[issueId];
    if (!newComment?.trim()) {
      return;
    }

    const addedComment = await addComment(issueId, newComment);
    console.log('Added comment:', addedComment);

    if (addedComment) {
      setProjectComments(prevComments => {
        const updatedComments = {...prevComments};
        updatedComments[projectId][issueId].comments.push({
          authorName: addedComment.author.displayName,
          body: newComment,
          jiraLink: addedComment.jiraLink,
        });
        return updatedComments;
      });
      setNewComments(prevNewComments => ({
        ...prevNewComments,
        [issueId]: '',
      }));
    }
  };

  const handleCommentChange = (issueId, text) => {
    setNewComments(prevNewComments => ({
      ...prevNewComments,
      [issueId]: text,
    }));
  };

  const formatCommentText = text => {
    const regex = /@([а-яА-ЯёЁa-zA-Z0-9_]+)/g;
    const parts = text.split(regex);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <Text key={index} style={{color: '#4a90e2', fontWeight: 'bold'}}>
            {part}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#4a90e2'}}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
          backgroundColor: '#4a90e2',
        }}>
        <Text
          style={{
            fontSize: 24,
            color: 'white',
            marginBottom: 20,
            textAlign: 'center',
          }}>
          Comments for user {displayName}
        </Text>

        {projects.map(project => (
          <View
            key={project.id}
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 15,
              marginBottom: 15,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#4a90e2',
                marginBottom: 10,
              }}>
              In Project: {project.name}
            </Text>

            {Object.entries(projectComments[project.id] || {}).map(
              ([issueId, issueData]) => (
                <View key={issueId} style={{marginBottom: 15}}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: '#4a90e2',
                      marginBottom: 5,
                    }}>
                    In card: {issueData.cardName}
                  </Text>

                  <Text style={{fontSize: 12, color: '#4a90e2'}}>
                    Jira link:
                    <Text
                      style={{
                        color: '#4a90e2',
                        textDecorationLine: 'underline',
                      }}
                      onPress={() =>
                        Linking.openURL(issueData.comments[0]?.jiraLink)
                      }>
                      {issueData.comments[0]?.jiraLink}
                    </Text>
                  </Text>

                  {issueData.comments.map((comment, index) => (
                    <View key={index} style={{marginBottom: 5}}>
                      <Text style={{fontSize: 14, color: '#666'}}>
                        By: {comment.authorName}
                      </Text>
                      <Text style={{fontSize: 14, color: '#333'}}>
                        {formatCommentText(comment.body)}
                      </Text>
                      {comment.imageUrl ? (
                        <Image
                          source={{uri: comment.imageUrl}}
                          style={{
                            width: 100,
                            height: 100,
                            marginTop: 5,
                            borderRadius: 5,
                          }}
                          onError={() =>
                            console.log(
                              'Failed to load image:',
                              comment.imageUrl,
                            )
                          }
                        />
                      ) : (
                        <Text style={{fontSize: 12, color: '#888'}}></Text>
                      )}
                    </View>
                  ))}

                  <TextInput
                    placeholder="Add a comment..."
                    value={newComments[issueId] || ''}
                    onChangeText={text => handleCommentChange(issueId, text)}
                    style={{
                      borderColor: '#e0e0e0',
                      borderWidth: 1,
                      borderRadius: 5,
                      padding: 10,
                      marginBottom: 10,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => handleAddComment(issueId, project.id)}
                    style={{
                      backgroundColor: '#4a90e2',
                      padding: 10,
                      borderRadius: 5,
                      alignItems: 'center',
                    }}>
                    <Text style={{color: 'white', fontWeight: 'bold'}}>
                      Add Comment
                    </Text>
                  </TouchableOpacity>
                </View>
              ),
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
