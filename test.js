const test = require('ava');

const {
  rule: createRule,
  not,
  and,
  or,
  some,
  every
} = require('.');

const trueRule = createRule(async () => true, { name: 'true' });
const falseRule = createRule(async () => false, { name: 'false' });
const anonymousRule = createRule(async () => true);

const assertTrue = async (rule, t) => t.true(await rule.value, rule.name);
const assertFalse = async (rule, t) => t.false(await rule.value, rule.name);

test('and', async t => {
  let rule = trueRule.and(falseRule, { name: 'true && false' });
  await assertFalse(rule, t);

  rule = and([trueRule, falseRule], { name: 'true && false' });
  await assertFalse(rule, t);

  rule = trueRule.and(trueRule, { name: 'true && true' });
  await assertTrue(rule, t);

  rule = and([trueRule, trueRule], { name: 'true && true' });
  await assertTrue(rule, t);

  rule = falseRule.and(falseRule, { name: 'false && false' });
  await assertFalse(rule, t);

  rule = and([falseRule, falseRule], { name: 'false && false' });
  await assertFalse(rule, t);

  rule = and([], { name: 'empty and' });
  await assertFalse(rule, t);
});

test('or', async t => {
  let rule = trueRule.or(trueRule, { name: 'true || true' });
  const val = await rule.value;
  t.true(val, rule.name);

  rule = or([trueRule, trueRule], { name: 'true || true' });
  await assertTrue(rule, t);

  rule = trueRule.or(falseRule, { name: 'true || false' });
  await assertTrue(rule, t);

  rule = or([trueRule, falseRule], { name: 'true || false' });
  await assertTrue(rule, t);

  rule = falseRule.or(trueRule, { name: 'false || true' });
  await assertTrue(rule, t);

  rule = or([falseRule, trueRule], { name: 'false || true' });
  await assertTrue(rule, t);

  rule = falseRule.or(falseRule, { name: 'false || false' });
  await assertFalse(rule, t);

  rule = or([falseRule, falseRule], { name: 'false || false' });
  await assertFalse(rule, t);

  rule = or([], { name: 'empty or' });
  await assertFalse(rule, t);
});

test('not', async t => {
  let rule = not(trueRule, { name: '!true' });
  await assertFalse(rule, t);

  rule = not(falseRule, { name: '!false' });
  await assertTrue(rule, t);
});

test('some', async t => {
  let rule = some([trueRule, trueRule], { name: 'some(true, true)' });
  const val = await rule.value;
  t.true(val, rule.name);

  rule = some([trueRule, falseRule], { name: 'some(true, false)' });
  await assertTrue(rule, t);

  rule = some([falseRule, falseRule], { name: 'some(false, false)' });
  await assertFalse(rule, t);

  rule = some([], { name: 'empty some' });
  await assertFalse(rule, t);
});

test('every', async t => {
  let rule = every([trueRule, trueRule], { name: 'every(true, true)' });
  const val = await rule.value;
  t.true(val, rule.name);

  rule = every([trueRule, falseRule], { name: 'every(true, false)' });
  await assertFalse(rule, t);

  rule = every([falseRule, falseRule], { name: 'every(false, false)' });
  await assertFalse(rule, t);

  rule = every([], { name: 'empty every' });
  await assertFalse(rule, t);
});

test('errors', async t => {
  const ruleError = new Error('Rule error');

  const throwsRule = createRule(async () => {
    throw ruleError;
  }, { name: 'throws rule' });

  await t.throwsAsync(throwsRule.value, { is: ruleError });

  const value = await throwsRule.value
    .catch(err => {
      t.is(err, ruleError, 'caught error');

      return true;
    });

  t.true(value, 'resolved value');
});

test('anonymous', t => {
  t.is(anonymousRule.name, undefined, 'rule name');
});
