<template>
    <label
            class="cx-checkbox"
            :class="[
              { 'is-disabled': isDisabled },
              { 'is-checked': isChecked }
            ]"
            role="checkbox"
            :aria-checked="indeterminate ? 'mixed': isChecked"
            :aria-disabled="isDisabled"
    >
    <span class="cx-checkbox__input"
          :class="{
        'is-disabled': isDisabled,
        'is-checked': isChecked,
        'is-indeterminate': indeterminate,
        'is-focus': focus
      }"
          aria-checked="mixed"
    >
      <!--框框内部打钩符号 伪类-->
      <span class="cx-checkbox__inner"></span>
      <input
              v-if="trueLabel || falseLabel"
              class="cx-checkbox__original"
              v-model="model"
              :true-value="trueLabel"
              :false-value="falseLabel"
              type="checkbox"
              aria-hidden="true"
              :name="Name"
              :disabled="isDisabled"
              @change="handleChange"
              @focus="focus = true"
              @blur="focus = false">
      <input
              v-else
              class="cx-checkbox__original"
              v-model="model"
              type="checkbox"
              aria-hidden="true"
              :disabled="isDisabled"
              :name="Name"
              :value="label"
              @change="handleChange"
              @focus="focus = true"
              @blur="focus = false">
    </span>
        <!--如果插槽中有内容，后者label有值则渲染-->
        <span class="cx-checkbox__label" v-if="$slots.default || label">
      <slot></slot>
            <!--如果插槽中无有内容，则采用label的值-->
      <template v-if="!$slots.default">{{label}}</template>
    </span>
    </label>
</template>
<script>
    import Emitter from './mixins/emitter';

    export default {
        name: 'CXCheckbox',
        componentName: 'CXCheckbox',
        mixins: [Emitter],
        data() {
            return {
                defaultModel: false,//默认 model 值
                focus: false,//失焦/聚焦 - 通过数据改变样式
                Name: 'cx-element-tree-checkbox'
            };
        },
        computed: {
            model: {
                get() {
                    return this.value !== undefined
                        ? this.value : this.defaultModel;
                },

                set(val) {
                    this.$emit('input', val);
                    this.defaultModel = val;
                }
            },

            isChecked() {
                if ({}.toString.call(this.model) === '[object Boolean]') {
                    return this.model;
                } else if (Array.isArray(this.model)) {
                    return this.model.indexOf(this.label) > -1;
                } else if (this.model !== null && this.model !== undefined) {
                    return this.model === this.trueLabel;
                }
            },
            isDisabled() {
                return this.disabled || (this.elForm || {}).disabled;
            },
        },

        props: {
            value: {},
            label: {},
            indeterminate: Boolean,
            disabled: Boolean,
            checked: Boolean,
            trueLabel: [String, Number],
            falseLabel: [String, Number],
        },

        methods: {
            addToStore() {
                if (
                    Array.isArray(this.model) &&
                    this.model.indexOf(this.label) === -1
                ) {
                    this.model.push(this.label);
                } else {
                    this.model = this.trueLabel || true;
                }
            },
            handleChange(ev) {
                let value;
                if (ev.target.checked) {
                    value = this.trueLabel === undefined ? true : this.trueLabel;
                } else {
                    value = this.falseLabel === undefined ? false : this.falseLabel;
                }
                this.$emit('change', value, ev);//value - 更新后的值  ev - 操作对象
            }
        },

        created() {
            this.checked && this.addToStore();
        }
    };
</script>
