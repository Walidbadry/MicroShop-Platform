pipeline {
    agent any

    environment {
        COMPOSE_FILE = 'docker-compose.yml'
        DOCKER_REGISTRY = 'walidbadry' // اسم حسابك على Docker Hub
        GITHUB_CREDENTIALS = 'github-token' // الـ Jenkins credential ID
        DOCKER_CREDENTIALS = 'dockerhub-token' // credential ID للـ Docker Hub
    }

    stages {
        stage('Checkout') {
            steps {
                git(
                    url: 'https://github.com/Walidbadry/your-repo.git',
                    branch: 'main',
                    credentialsId: "${GITHUB_CREDENTIALS}"
                )
            }
        }

        stage('Build & Test Services') {
            parallel {
                stage('Users Service') {
                    steps {
                        dir('users-service') {
                            sh 'docker build -t users-service:latest .'
                            // لو عندك اختبارات: sh 'pytest tests/' أو npm test
                        }
                    }
                }
                stage('Orders Service') {
                    steps {
                        dir('orders-service') {
                            sh 'docker build -t orders-service:latest .'
                        }
                    }
                }
                stage('Gateway') {
                    steps {
                        dir('gateway') {
                            sh 'docker build -t gateway:latest .'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'docker build -t frontend:latest .'
                        }
                    }
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh 'docker tag users-service:latest $DOCKER_REGISTRY/users-service:latest'
                    sh 'docker tag orders-service:latest $DOCKER_REGISTRY/orders-service:latest'
                    sh 'docker tag gateway:latest $DOCKER_REGISTRY/gateway:latest'
                    sh 'docker tag frontend:latest $DOCKER_REGISTRY/frontend:latest'
                    sh 'docker push $DOCKER_REGISTRY/users-service:latest'
                    sh 'docker push $DOCKER_REGISTRY/orders-service:latest'
                    sh 'docker push $DOCKER_REGISTRY/gateway:latest'
                    sh 'docker push $DOCKER_REGISTRY/frontend:latest'
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                // مثال: تشغيل Docker Compose على نفس السيرفر
                sh 'docker-compose -f $COMPOSE_FILE pull'
                sh 'docker-compose -f $COMPOSE_FILE up -d'
            }
        }
    }

    post {
        always {
            echo "CI/CD Pipeline Finished"
        }
    }
}
