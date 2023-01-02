Rails.application.routes.draw do
  devise_for :users, :controllers => { registrations: 'users/registrations' }

  get 'employees/index'
  resources :employees, except: 'index'
  get "employees/*path", to: 'employees#index', via: :get

  get 'media/download', to: 'media#download', via: :get #for public or private media (TODO add auth logic)
  resources 'media'


  namespace :admin do
    resource :users, only: ['export', 'query', 'index'] do
      get 'export', to: 'users#export'
      post 'query', to: 'users#query'
    end
    resources :users
    resources :media
  end

  get 'admin/users*path', to: 'admin/users#index'
  
  #scope :admin do
  #  resources :users, module: 'admin', path: '/users'
  #end

  resources :users do
    resources :media
    resources :employees
  end
  resources :employees do
    resources :media
    resources :users
  end
  
  get "*path", to: 'root#index'
  root 'root#index'

  # resources __path__ means assign all CRUD routes/actions without having to map each one (get... post.. etc.)
  resources :users

end
