
const rule = (fn, { name } = {}) => ({
  and (otherRule, opts) {
    return rule(async () => await this.value && otherRule.value, opts);
  },

  or (otherRule, opts) {
    return rule(async () => await this.value || otherRule.value, opts);
  },

  get name () {
    return name;
  },

  get value () {
    return fn().then(res => (res === true));
  }
});

const not = (someRule, opts) => rule(() => someRule.value.then(isTrue => !isTrue), opts);

const truthy = opts => rule(async () => true, opts);
const falsy = opts => rule(async () => false, opts);

const and = (rules, opts) => {
  if (!rules.length) {
    return falsy(opts);
  }

  let res = truthy(opts);

  for (const next of rules) {
    res = res.and(next, opts);
  }

  return res;
};

const or = (rules, opts) => {
  if (!rules.length) {
    return falsy(opts);
  }

  let res = falsy(opts);

  for (const next of rules) {
    res = res.or(next, opts);
  }

  return res;
};

const toValue = rule => rule.value;
const someTrue = values => values.some(v => v === true);
const allTrue = values => values.every(v => v === true);

const some = (rules, opts) => {
  if (!rules.length) {
    return falsy(opts);
  }

  return rule(() => Promise.all(rules.map(toValue)).then(someTrue), opts);
};

const every = (rules, opts) => {
  if (!rules.length) {
    return falsy(opts);
  }

  return rule(() => Promise.all(rules.map(toValue)).then(allTrue), opts);
};

module.exports = {
  rule,
  and,
  or,
  not,
  some,
  every,
  truthy,
  falsy
};
