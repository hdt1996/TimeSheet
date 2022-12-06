Rails.application.routes.draw do
  get 'media/download'
  devise_for :users, :controllers => { registrations: 'users/registrations' }
  get 'admin/index'

  resources 'media'
  
  get 'employees/show'
  get 'employees/index'
  get "employees/*path", to: 'employees#index', via: :all
  root 'root#index'
  get "*path", to: 'root#index', via: :get


  # resources __path__ means assign all CRUD routes without having to map each one (get... post.. etc.)
  resources :users do
    resources :employees
  end

  resources :employees do
    resources :media
  end
end
