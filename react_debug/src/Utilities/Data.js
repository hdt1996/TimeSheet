export default class Extractors
{
    static foreignKey(keys,source)
    {
        let extracted = [];
        for(let i = 0; i < keys.length; i++)
        {
            extracted.push(source[keys[i]]);
        };
        extracted = extracted.join(' - ');
        return extracted;
    };

    static standard(keys,source) //keys is only one
    {
        return source;
    };
    static numerical_2dp(keys,source) //keys is only one
    {
        if(source)
        {
            return source.toFixed(2);
        };
        return source;
    };
    static strfDate(keys,source)
    {
        return source.replace(/(T.*)/,'')
    };
};
