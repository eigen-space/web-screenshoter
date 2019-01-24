pipeline {
    agent {
        docker { image 'node:lts-alpine' }
    }
    stages {
        stage('Test') {
            when {
                branch 'master';
            }

            steps {
                sh 'node --version';
            }
        }
    }
}