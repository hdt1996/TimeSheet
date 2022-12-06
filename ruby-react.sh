rails new debug_rails -d postgresql -j webpack
yarn add react react-dom react-router-dom
# Add devise to gemfile prior to install
rails generate devise:install
rails g devise:views
rails generate devise user
rails db:migrate
rails routes #SETS UP ROUTES for devise and db/resources
#rails generate migration add_role_to_users role:integer
rails generate model _name_
# Remember that model name should be plural (medium => media (plural))
# Table created will be media, model name will be medium
# Controller: should use singular
