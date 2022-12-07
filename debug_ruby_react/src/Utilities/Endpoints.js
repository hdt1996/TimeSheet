import getToken from './Token'

var domain = "http://server-django-prod.us-west-2.elasticbeanstalk.com";
if(process.env.NODE_ENV === 'development')
{
    domain = "http://192.168.1.17:8005";
};

async function fetcherModify(method, body, endpoint)
{
    const requestOptions={
        method: method,
        headers:{'Content-Type': 'application/json', 'X-CSRFToken': getToken('csrftoken')},
        body:JSON.stringify(body)
    };
    let response = await fetch(`${domain}${endpoint}`,requestOptions);
    let data = await response.json();
    return data;
};

async function fetcherSelect(method, selectors, endpoint)
{
    const requestOptions={
        method: method,
        headers:{'Content-Type': 'application/json','X-CSRFToken': getToken('csrftoken'), 'selectors':JSON.stringify(selectors)}
    };
    let response = await fetch(`${domain}${endpoint}`, requestOptions);
    let data = await response.json();
    return data;
};

export default class Endpoints
{
    static logInAPI = "/user/login/";
    static createLoginAPI = "/user/create/";
    static checkAuthAPI='/user/authenticated/';
    static logOutAPI = '/user/logout/';
    static getCSRFAPI = '/user/getCSRF/';
};


async function login (signin_data)
{
    let data = await fetcherModify('POST',signin_data, Endpoints.logInAPI);
    return data;
};
async function createLogin(signup_data)
{
    let data = await fetcherModify('POST',signup_data, Endpoints.createLoginAPI);
    return data;
};
async function checkAuth()
{
    let data = await fetcherSelect('GET',null, Endpoints.checkAuthAPI);
    return data;
};
async function logOut()
{
    let data = await fetcherModify('POST',null, Endpoints.logOutAPI);
    return data;
};
async function getCSRF()
{
    let data = await fetcherSelect('GET',null, Endpoints.getCSRFAPI);
    return data;
};

export {fetcherModify, fetcherSelect, login, createLogin, checkAuth, logOut, getCSRF}