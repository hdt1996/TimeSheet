rails new debug_rails -d postgresql -j webpack
yarn add react react-dom react-router-dom
# Add devise to gemfile prior to install
rails generate devise:install
rails g devise:views
rails generate devise user
rails db:migrate
rails routes #SETS UP ROUTES for devise and db/resources
