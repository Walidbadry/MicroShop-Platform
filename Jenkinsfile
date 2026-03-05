pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS = 'dockerhub-token'
    }

    stages {
        stage('Test Docker Login') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "Logging in to Docker Hub..."
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        
                        echo "Login successful, printing Docker info..."
                        docker info
                        
                        echo "Logging out..."
                        docker logout
                    '''
                }
            }
        }
    }
}
