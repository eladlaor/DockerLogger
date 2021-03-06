const obj = {
    key: "hi",
    value: "val"
}

const str = {...obj};

console.log(str);
console.log(obj);
console.log(JSON.stringify(obj));