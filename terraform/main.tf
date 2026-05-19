terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Based on your previous EC2 instance, you are likely using the eu-north-1 region
provider "aws" {
  region = "eu-north-1"
}

# 1. Create a Security Group to open necessary ports
resource "aws_security_group" "expense_tracker_sg" {
  name        = "expense-tracker-sg-tf"
  description = "Allow inbound traffic for Expense Tracker"

  # SSH access
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Frontend port
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Jenkins port
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend API port
  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic (so the server can download docker, updates, etc.)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 2. Fetch the latest Ubuntu 24.04 AMI dynamically
data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical's official AWS account ID
}

# 3. Create the EC2 Instance
resource "aws_instance" "expense_tracker_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro" # t3.micro is the free tier for eu-north-1
  
  # This uses the exact key pair name you created earlier
  key_name      = "expense-tracker-key" 

  vpc_security_group_ids = [aws_security_group.expense_tracker_sg.id]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  # User Data: This script runs automatically when the server boots up!
  # We will use it to automatically install the modern Docker and Docker Compose Plugin.
  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update
              sudo apt-get install -y ca-certificates curl
              sudo install -m 0755 -d /etc/apt/keyrings
              sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
              sudo chmod a+r /etc/apt/keyrings/docker.asc
              echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
              sudo apt-get update
              sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
              sudo usermod -aG docker ubuntu
              EOF

  tags = {
    Name = "ExpenseTracker-Terraform"
  }
}

# 4. Output the new Public IP to the terminal so we can easily copy it
output "server_public_ip" {
  description = "The public IP address of the new web server"
  value       = aws_instance.expense_tracker_server.public_ip
}
