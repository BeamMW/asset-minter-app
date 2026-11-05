const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const babel = require('@babel/core');

// Exercise the actual page with a fake wallet boundary; never register an asset.
const filename = path.resolve(__dirname, '../src/app/containers/Main/containers/CreatePage/CreatePage.tsx');
const { code } = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
  filename, babelrc: false, configFile: false,
  presets: ['@babel/preset-typescript', '@babel/preset-react'],
  plugins: ['@babel/plugin-transform-modules-commonjs'],
});

function harness() {
  const states = [];
  let cursor = 0;
  let config;
  let values;
  const calls = [];
  const React = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    useState: (initial) => {
      const index = cursor++;
      if (!(index in states)) states[index] = initial;
      return [states[index], (value) => { states[index] = value; }];
    },
  };
  const imports = {
    react: React,
    '@linaria/react': { styled: new Proxy({}, { get: (_, tag) => () => tag }) },
    '@linaria/core': { css: () => '' },
    '@app/shared/components': { Button: 'Button', Window: 'Window', Input: 'Input', BackControl: 'BackControl' },
    'react-router-dom': { useNavigate: () => () => {} },
    formik: { useFormik: (options) => {
      config = options;
      values = values || { ...options.initialValues };
      return { values, errors: {}, isValid: true, validateForm: () => config.validate(values), setFieldValue() {}, submitForm() {}, resetForm() {} };
    } },
    '@core/api': { CreateAsset: (...args) => calls.push(args) },
    '@app/shared/constants': { ROUTES: { MAIN: { MAIN_PAGE: '/' } } },
    '@app/shared/components/CopyIconButton': 'CopyIconButton',
  };
  const exports = {};
  vm.runInNewContext(code, { exports, require: (name) => {
    assert.ok(name in imports, `Unexpected dependency: ${name}`);
    return imports[name];
  } });
  const render = () => { cursor = 0; return exports.default(); };
  render();
  return { render, states, calls, values, get config() { return config; } };
}

function find(node, predicate) {
  if (!node || typeof node !== 'object') return undefined;
  if (predicate(node)) return node;
  return (node.children || []).flat(Infinity).map(child => find(child, predicate)).find(Boolean);
}

const validFields = {
  asset_name: 'Example', unit_name: 'EXAMPLE', short_name: 'EX',
  sm_unit_name: 'SMALLEST', limit: '100',
};

test('creation displays a disabled eight-decimal control, not an editable ratio', () => {
  const h = harness();
  const tree = h.render();
  const input = find(tree, node => node.props.name === 'decimal_places');
  assert.ok(input);
  assert.equal(input.props.value, '8');
  assert.equal(input.props.disabled, true);
  assert.match(input.props.label, /100,000,000/);
  assert.equal(find(tree, node => node.props.name === 'ratio'), undefined);
});

test('wallet submission and copied CLI metadata always use the fixed ratio', async () => {
  for (const suppliedRatio of ['', '8', '0', '21000000', '100000000']) {
    const h = harness();
    Object.assign(h.values, validFields, { ratio: suppliedRatio });
    const errors = await h.config.validate(h.values);
    assert.equal(Object.keys(errors).length, 0);
    const expected = 'STD:SCH_VER=1;N=Example;UN=EXAMPLE;SN=EX;NTHUN=SMALLEST;NTH_RATIO=100000000;';
    h.states[2] = true; // Open the command panel.
    const tree = h.render();
    const copy = find(tree, node => node.type === 'CopyIconButton');
    assert.ok(copy.props.onCopy().includes(`--asset_meta "${expected}"`));
    await find(tree, node => node.props.className === 'create-asset').props.onClick();
    assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0][0], expected);
    assert.equal(h.calls[0][1], '100');
  }
});

test('required asset fields still fail validation', async () => {
  const h = harness();
  const errors = await h.config.validate(h.values);
  for (const field of ['asset_name', 'unit_name', 'short_name', 'sm_unit_name', 'limit']) {
    assert.equal(errors[field], 'Required');
  }
  assert.equal(h.calls.length, 0);
});

test('metadata values cannot inject a second ratio and submission revalidates', async () => {
  const h = harness();
  Object.assign(h.values, validFields);
  await h.config.validate(h.values);
  h.values.short_descr = 'Example;NTH_RATIO=8';
  const errors = await h.config.validate(h.values);
  assert.match(errors.short_descr, /Semicolons/);
  h.states[2] = true;
  assert.equal(find(h.render(), node => node.type === 'CopyIconButton'), undefined);
  await find(h.render(), node => node.props.className === 'create-asset').props.onClick();
  assert.equal(h.calls.length, 0);
});
