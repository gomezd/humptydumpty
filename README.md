# @gomezd/humptydumpty

Logic async rules evaluation

## Installation

```sh
npm i @gomezd/humptydumpty
```

## Usage

```js

const {
  rule: createRule
  not,
  and,
  or,
  some,
  every
} = require('@gomezd/humptydumpty');

const trueRule = createRule(async () => true, { name: 'truthy' });
const falseRule = createRule(async () => false, { name: 'falsy' });

trueRule.name; // 'truthy'

await trueRule.value; // true
await falseRule.value; // false

let combined = trueRule.and(falseRule, { name: 'truthy and falsy' });
await combined.value; // false
combined.name; // 'truthy and falsy'

combined = trueRule.and(trueRule);
await combined.value; // true
combined.name; // undefined

await trueRule.and(falseRule).value; // true

combined = and([trueRule, falseRule], { name: 'truthy and falsy' });
await combined.value; // false
combined.name; // 'truthy and falsy'

await and([trueRule, trueRule]).value; // true

await trueRule.or(falseRule).value; // true

await or([falseRule, falseRule]); // false

await not(trueRule).value; // false

await some([trueRule, falseRule]).value; // true

const throwsRule = createRule(async () => {
    throw new Error('oops');
});

await throwsRule.value.catch(err => {
    // handle 'oops'
    return true;
}); // true
```


