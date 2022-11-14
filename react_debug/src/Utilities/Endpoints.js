let domain = "http://server-django-prod.us-west-2.elasticbeanstalk.com";
if(process.env.NODE_ENV === 'development')
{
    domain = "http://192.168.1.17:8005";
};

export default class Endpoints
{
    static domain = domain;
    static logInAPI = "/user/login/";
    static createLogin = "/user/create/";
    static checkAuthAPI='/user/authenticated/';
    static logOutAPI = '/user/logout/';
    static getCSRF = '/user/getCSRF/';
}