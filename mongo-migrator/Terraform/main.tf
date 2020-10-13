provider "aws" {
  region  = "us-east-1"
  shared_credentials_file = "/Users/davidjoy/.aws/credentials"
  profile = "fieldops"
}

# Creates VPC 
resource "aws_vpc" "stargate_vpc" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "stargate_vpc"
  }
}

# Creates Subnet 
resource "aws_subnet" "stargate_subnet" {
  vpc_id     = aws_vpc.stargate_vpc.id
  cidr_block = "10.0.0.0/24"
  availability_zone = var.availability_zone

  tags = {
    Name = "stargate_subnet"
  }
}

# Create Internet Gateway 
resource "aws_internet_gateway" "stargate_igw" {
  vpc_id = aws_vpc.stargate_vpc.id

  tags = {
        Name = "stargate_igw"
  }
}

# Create Route table 
resource "aws_route_table" "stargate_rt" {
  vpc_id = aws_vpc.stargate_vpc.id
  route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.stargate_igw.id
  }

  tags = {
        Name = "stargate_rt"
  }
}

resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.stargate_subnet.id
  route_table_id = aws_route_table.stargate_rt.id
}


# Security group rules:
# - open SSH port (22) from anywhere
#
resource "aws_security_group" "sg_ssh" {
   name = "sg_ssh"
   vpc_id     = aws_vpc.stargate_vpc.id

   ingress {
      from_port = 22
      to_port = 22
      protocol = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
   }

   egress {
      from_port = 0
      to_port = 0
      protocol = "-1"
      cidr_blocks = ["0.0.0.0/0"]
   }
}


# associate route table with subnet
# resource "aws_route_table_association" "test_tf_a_rt" {
#  subnet_id      = aws_subnet.stargate_subnet.id
#  route_table_id = aws_route_table.stargate_rt.id
#}

# EC2 Instances for DSE 

resource "aws_instance" "dse" {
  ami = var.ami_id
  instance_type = var.instance_type[0]
  count = var.instance_count[0].count
  subnet_id = aws_subnet.stargate_subnet.id
  availability_zone = var.availability_zone
  associate_public_ip_address = true
  security_groups = [aws_security_group.sg_ssh.id]
  key_name = var.key_name

  tags = {
    Name = "stargate-${var.instance_count[0].name}-node-${count.index}"
  }

  user_data = data.template_file.user_data.rendered
}

# EC2 Instances for OPSC 

resource "aws_instance" "opsc" {
  ami = var.ami_id
  instance_type = var.instance_type[0]
  count = var.instance_count[1].count
  subnet_id = aws_subnet.stargate_subnet.id
  availability_zone = var.availability_zone
  associate_public_ip_address = true
  security_groups = [aws_security_group.sg_ssh.id]
  key_name = var.key_name

  tags = {
    Name = "stargate-${var.instance_count[1].name}-${count.index}"
  }

  user_data = data.template_file.user_data.rendered
}

data "template_file" "user_data" {
   template = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install python-minimal -y
              apt-get install ntp -y
              apt-get install ntpstat -y
              ntpq -pcrv
              
              # Raid 0 - Configuration 
              sudo mdadm --create --verbose /dev/md0 --level=0 --name=vol_mongo_raid --raid-devices=3 /dev/nvme0n1 /dev/nvme1n1 /dev/nvme2n1
              sudo mkfs.ext4 -L vol_mongo_raid /dev/md0
              sudo mdadm --detail --scan | sudo tee -a /etc/mdadm.conf
              sudo apt-get install dracut
              sudo dracut -H -f /boot/initramfs-$(uname -r).img $(uname -r)
              sudo mkdir -p /mnt/mongo
              sudo mount LABEL=vol_stargate_raid /mnt/mongo
              # Mount another drive
              mkfs.ext4 /dev/nvme3n1
              mkdir /mnt/nvme3n1
              mount /dev/nvme3n1 /mnt/nvme3n1
              echo "/dev/mod0 /mnt/mongo ext4 noatime,data=writeback,barrier=0,nobh 0 0" | sudo cat >> /etc/fstab
              echo "/dev/nvme3n1 /mnt/nvme3n1 ext4 noatime,data=writeback,barrier=0,nobh 0 0" | sudo cat >> /etc/fstab
              mount -a
              EOF
}