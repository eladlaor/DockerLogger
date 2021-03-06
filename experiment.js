const obj1 = {
    a : "sababa"
}

const obj2 = {
    other : "sababa"
}

const obj3 = {
    whatever : "diff"
}

const sameKey = {
    a : "sababa"
}


console.log(JSON.stringify(obj1) === JSON.stringify(sameKey));

console.log(obj1);