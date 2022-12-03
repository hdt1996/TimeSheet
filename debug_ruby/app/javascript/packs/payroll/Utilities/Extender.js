export default function Extender(proto, classes)
// Only works for nonconstructed classes to add as "Utility" classes
// Here constructor is omitted and instantiation only happens to get the copy of the methods or properties
{
    let entries;
    let instantiated;
    let entry_map = {};
    for(let i in classes)
    {
        instantiated = new classes[i]();
        entries = Object.getOwnPropertyNames(instantiated.__proto__).slice(1);
        for(let p = 0; p < entries.length; p++)
        {
            entry_map[entries[p]] = instantiated[entries[p]];

        };
        Object.assign(proto,entry_map);
    };
};