# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

  config.vm.box = "precise64_vmware"
  config.vm.box_url = "http://files.vagrantup.com/precise64_vmware.box"
  config.vm.network :forwarded_port, host: 1337, guest: 3000
  config.vm.provision :shell, :path => "provision.sh"

end
