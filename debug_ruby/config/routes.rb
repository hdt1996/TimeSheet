Rails.application.routes.draw do
  get 'employee/index'
  get 'payroll/index'
  get "payroll", to: 'payroll#index', via: :all
  get "payroll/*path", to: 'payroll#index', via: :all
  #devise_for :users
  devise_for :users, :controllers => { registrations: 'users/registrations' }
  root 'root#index'
  get "*path", to: 'root#index', via: :get
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  # resources __path__ means assign all CRUD routes without having to map each one (get... post.. etc.)
  #resources :table do
  #  resources :associated_table
  #end
end
