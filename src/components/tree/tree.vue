<template>
    <div class="cx-tree"
         role="tree"
         :class="{
         'cx-tree--current-highlight': highlightCurrent,
         }"
    >
        <cx-tree-node
                v-for="(child, index) in root.childNodes"
                :node="child"
                :key="index"
                :branchID="index + 1"
                @node-expand="handleNodeExpand"
        ></cx-tree-node>
        <div class="cx-tree__empty-block" v-if="isEmpty">
            <span class="cx-tree__empty-text">{{ emptyText }}</span>
        </div>

    </div>
</template>

<script>
    import TreeStore from './model/tree-store';
    import cxTreeNode from './tree-node'
    import Emitter from './mixins/emitter';
    import {lang} from './locale';
    import {judgeType, replaceParam} from './utils'


    export default {
        name: "CXTree",
        mixins: [Emitter],
        components: {cxTreeNode},
        data() {
            return {
                isCXTree: true,
                store: null,
                root: null,
                currentNode: null,


                //默认 check 配置对象
                defaultCheckConfig: {
                    leafOnly: false,
                    includeHalfChecked: false,
                    removal: false,
                    transform: val => val
                },
            }
        },
        model: {
            prop: 'defaultCheckedKeys',
            event: 'change'
        },
        computed: {
            //选中的节点的 key 所组成的数组 存储
            checkedKeysStore: {
                get() {
                    return this.defaultCheckedKeys;
                },

                set(val) {
                    this.defaultCheckedKeys.splice(0, this.defaultCheckedKeys.length);
                    val.forEach(key => {
                        this.defaultCheckedKeys.push(key);
                    });
                }
            },
            isEmpty() {
                const {childNodes} = this.root;//childNodes 是子node节点 集合

                /**
                 * 判断树组件显示为空的情况：
                 * 1、node 节点下 不存在 childNodes 字段或者 childNodes 为空。即：渲染树组件的数据为空或者不存在
                 * 2、childNodes 集合下所有node子节点 visible 字段都 为false，即：全部隐藏
                 */
                return !childNodes || childNodes.length === 0 || childNodes.every(({visible}) => !visible);
            },
            //混合 check 配置对象（ 用于配置 输出勾选的节点 格式和内容)
            mixinCheckConfig() {
                return Object.assign(this.defaultCheckConfig, this.checkConfig);
            }
        },
        props: {
            checkedModel: Array,//默认勾选的节点的 key 的数组

            defaultCheckedKeys: Array,//默认勾选的节点的 key 的数组


            //check 配置对象（ 用于配置 输出勾选的节点 格式和内容)
            checkConfig: {
                type: Object,
                validator: function (val) {
                    const _bol = ['leafOnly', 'includeHalfChecked', 'removal'];
                    const _fn = ['transform'];
                    let s = true;

                    const w = (key, type) => {
                        console.warn(`props - checkConfig. The type of ${key}'s value in the Object needs to be ${type}, find it.`);
                    };

                    Object.keys(val).forEach(function (key) {
                        // console.log(key, val[key]);
                        if (_bol.includes(key) && judgeType(val[key]) !== 'boolean') {
                            w(key, 'boolean');
                            s = false;
                        }
                        else if (_fn.includes(key) && judgeType(val[key]) !== 'function') {
                            w(key, 'function');
                            s = false;
                        }
                    });
                    return s
                }
            },
            data: {type: Array},
            //内容为空的时候展示的文本
            emptyText: {
                type: String,
                default() {
                    return lang('cx.tree.emptyText');
                }
            },
            props: {
                default() {
                    return {
                        children: 'children',
                        label: 'label',
                        disabled: 'disabled'
                    };
                }
            },
            showCheckbox: {type: Boolean, default: false},//节点是否可被选择(显示多选框)
            highlightCurrent: {type: Boolean, default: true},//是否高亮当前选中节点，默认值是 false。
            nodeKey: {type: String, default: 'id'},//每个树节点用来作为唯一标识的属性，整棵树应该是唯一的
            isExpandByClickNode: {type: Boolean, default: true},//是否在点击 node 节点的时候展开或者收缩节点

            currentNodeKey: [String, Number],//当前选中的节点 的 id

            /**
             * 展开子节点的时候是否自动展开父节点
             * 若该属性为false：当设置了默认展开的子节点时，子节点被自动展开。若父节点未展开时，界面显示，父节点闭合，当点击父节点时，直接呈现出展开的子节点。
             * 若该属性为true：当设置了默认展开的子节点时，子节点被自动展开，且父节点也被联动展开
             */
            autoExpandParent: {type: Boolean, default: true},
            renderAfterExpand: {type: Boolean, default: true},//是否在第一次展开某个树节点后才渲染其子节点
            defaultExpandedKeys: Array,//默认展开的节点的 key 的数组
            accordion: {type: Boolean, default: false},//手风琴模式 - 是否每次点击操作只打开一个同级树节点展开，初始状态不算
            defaultExpandAll: {type: Boolean, default: false},//是否默认展开所有节点
            checkStrictly: Boolean,//在显示复选框的情况下，是否严格的遵循父子不互相关联的做法，默认为 false
            checkOnClickNode: Boolean,//是否在点击节点的时候选中节点，默认值为 false，即只有在点击复选框时才会选中节点。
            filterNodeMethod: Function,//对树节点进行筛选时执行的方法，返回 true 表示这个节点可以显示，返回 false 则表示这个节点会被隐藏
        },
        watch: {
            //监听组件数据变化
            data(newVal) {
                this.store.setTreeData(newVal);//重新设置注入组件数据
            },

            defaultCheckedKeys(newVal) {
                this.store.setDefaultCheckedKey(newVal);
            },

            //监听 默认展开的节点 key
            defaultExpandedKeys(newVal) {
                //同步更新 store 实例对象中的字段值
                this.store.defaultExpandedKeys = newVal;
                //同步 执行展开操作
                this.store.setDefaultExpandedKeys(newVal);
            },
            checkStrictly(newVal) {
                this.store.checkStrictly = newVal;
            }

        },
        created() {
            this.isTree = true;

            this.store = new TreeStore({
                nodeKey: this.nodeKey,//每个树节点用来作为唯一标识的属性，整棵树应该是唯一的
                data: this.data,
                props: this.props,
                currentNodeKey: this.currentNodeKey,
                autoExpandParent: this.autoExpandParent,
                defaultExpandedKeys: this.defaultExpandedKeys,
                defaultExpandAll: this.defaultExpandAll,
                checkStrictly: this.checkStrictly,//在显示复选框的情况下，是否严格的遵循父子不互相关联的做法，默认为 false
                defaultCheckedKeys: this.defaultCheckedKeys,//默认勾选的节点的 key 的数组
                filterNodeMethod: this.filterNodeMethod,//对树节点进行筛选时执行的方法，返回 true 表示这个节点可以显示，返回 false 则表示这个节点会被隐藏
            });

            this.root = this.store.root;

            console.log('store - js store实例对象');
            console.log(this.store);
            console.log('root - js root实例对象');
            console.log(this.root);


        },
        methods: {
            /**
             * filter 删选
             * @param value
             */
            filter(value) {
                if (!this.filterNodeMethod) throw new Error('[Tree] filterNodeMethod is required when filter');
                this.store.filter(value);
            },

            /**
             * 最外层 树组件 展开节点
             * @param nodeData
             * @param node
             * @param instance
             */
            handleNodeExpand(nodeData, node, instance) {
                /**
                 * 事件广播
                 * 需要传入 组件名称  事件名称 当前节点node信息对象
                 */
                this.broadcast('CXTreeNode', 'element-tree-node-expand', node);
                this.$emit('node-expand', nodeData, node, instance);//向外抛出 事件 node-expand
            },


            /**
             * 获取当前节点node
             * 获取当前被选中节点的 data，若没有节点被选中则返回 null
             * @returns {null}
             */
            getCurrentNode() {
                const currentNode = this.store.getCurrentNode();
                return currentNode ? currentNode.data : null;
            },

            /**
             *
             * 获取当前节点的key
             * @returns {null}
             */
            getCurrentNodeKey() {
                return this.store.getCurrentNodeKey();
            },


            /**
             * get checked nodes 获取目前被选中的节点所组成的数组
             * 条件 - 若节点可被选择（即 show-checkbox 为 true）
             * @param leafOnly - 是否只是叶子节点，默认值为 false，叶子节点 - 没有子节点
             * @param includeHalfChecked -  是否包含半选节点
             * @returns {Array}
             */
            getCheckedNodes(leafOnly, includeHalfChecked) {
                if (!this.showCheckbox) console.warn(`Before using this method, set show-checkbox to ‘true’ first.`);
                return this.store.getCheckedNodes(
                    {
                        leafOnly: replaceParam(this.mixinCheckConfig.leafOnly, leafOnly),//带函数的参数，优先级高于checkConfig中所配置的值
                        includeHalfChecked: replaceParam(this.mixinCheckConfig.includeHalfChecked, includeHalfChecked)
                    }
                );
            },

            /**
             * get checked keys - 获取目前被选中的节点的 key 所组成的数组
             * 条件 - 若节点可被选择（即 show-checkbox 为 true）
             * @param leafOnly - 是否为叶子节点 - 没有子节点
             * @param includeHalfChecked -  是否包含半选节点
             * @param removal -  是否清楚无效key
             * @param transform -  key值转换函数
             * @returns {any[]}
             */
            getCheckedKeys(leafOnly, includeHalfChecked, removal, transform) {
                if (!this.showCheckbox) console.warn(`Before using this method, set show-checkbox to ‘true’ first.`);
                return this.store.getCheckedKeys(
                    //带函数的参数，优先级高于checkConfig中所配置的值
                    {
                        leafOnly: replaceParam(this.mixinCheckConfig.leafOnly, leafOnly),
                        includeHalfChecked: replaceParam(this.mixinCheckConfig.includeHalfChecked, includeHalfChecked),
                        removal: replaceParam(this.mixinCheckConfig.removal, removal),
                        transform: replaceParam(this.mixinCheckConfig.transform, transform)
                    }
                )
            },

            /**
             * get half checked nodes - 获取目前半选中的节点所组成的数组
             * 条件 - 若节点可被选择（即 show-checkbox 为 true）
             * @returns {Array}
             */
            getHalfCheckedNodes() {
                if (!this.showCheckbox) console.warn(`Before using this method, set show-checkbox to ‘true’ first.`);
                return this.store.getHalfCheckedNodes();
            },

            /**
             * get half checked keys - 获取目前半选中的节点的 key 所组成的数组
             * 条件 - 若节点可被选择（即 show-checkbox 为 true）
             * @returns {any[]}
             */
            getHalfCheckedKeys() {
                if (!this.showCheckbox) console.warn(`Before using this method, set show-checkbox to ‘true’ first.`);
                return this.store.getHalfCheckedKeys();
            },


        }
    }
</script>

<style lang="scss" scoped>

</style>
