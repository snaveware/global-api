pipeline {
    agent {
        docker {
            image 'node:latest'
            args '-u root:root'
        }
    }
    stages {
        stage('build') {
            steps {
                echo 'building global-api'
                sh 'node --version'
                sh 'npm --version'
                sh 'npm install'
                
            }
        }

        stage('test') {
            steps {
                echo 'testing global-api'
                sh 'npm run test'
            }
        }

        stage('dockerize') {
            steps {
                echo 'building global-api'
                script {

                    checkout scm

                    docker.withRegistry('https://registry.hub.docker.com', 'docker') {

                        def customImage = docker.build("snave020/global-api:pipeline")

                        /* Push the container to the custom Registry */
                        customImage.push()
                    }
                }
            }

            

           
        }

    }
       
    
}
