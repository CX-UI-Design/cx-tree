<template>
    <div class="tree-demo">
        <h1>tree-demo</h1>
        <h3>tree-checkbox</h3>
        <tree-checkbox
                v-model="checkboxModel"
                label="123123123"
        >
            树节点checkbox示例
        </tree-checkbox>
        <span>值：{{checkboxModel}}</span>
        <h3>tree-components</h3>
        <input type="text" placeholder="输入关键字进行过滤" v-model="filterText">
        <tree
                v-model="info.defaultCheckedKeys"
                :data="treedata"
                :is-expand-by-click-node="false"
                :defaultExpandedKeys="defaultExpandedKeys"
                :auto-expand-parent="true"
                :currentNodeKey="currentNodeKey"
                :defaultCheckedKeys="info.defaultCheckedKeys"

                :accordion="true"
                :defaultExpandAll="false"
                :renderAfterExpand="false"
                :highlight-current="true"
                :checkOnClickNode="true"
                :showCheckbox="true"

                :checkConfig="{
                    leafOnly: false,
                    includeHalfChecked: false,
                    removal: false,
                    transform: val=>val+'-!!'
                }"
                :filter-node-method="filterNode"

                @node-click="nodeClick"

                @node-expand="nodeExpand"
                @check="check"
                @check-change="checkChange"
                @node-contextmenu="nodeContextmenu"
                ref="cx-tree"
        >

        </tree>
        <div class="tree-demo--text">
            <div class="tree-demo--text-block">
                <button @click.stop="getTreeInfo">点击获取信息</button>
                <button @click.stop="changeData">改变树组件数据</button>
                <button @click.stop="clearData">清空树组件数据</button>
                <button @click.stop="clearData2">清空树组件数据2</button>
            </div>
            <div class="tree-demo--text-block">
                <button @click.stop="changeDefaultCheckedKeys">改变默认勾选的节点Keys</button>
            </div>
            <div class="tree-demo--text-block">
                <button @click.stop="getCheckedNodes">获取目前被选中的节点 Node 所组成的数组</button>
                <button @click.stop="getCheckedKeys">获取目前被选中的节点的 key 所组成的数组</button>
            </div>
            <div class="tree-demo--text-block">
                <p>当前CheckedKeys: {{info.defaultCheckedKeys}}</p>
                <p>当前节点node: {{info.currentNode}}</p>
                <p>当前节点key: {{info.currentNodeKey}}</p>
                <p>被选中的节点的 Node 对象数组: {{info.checkedNodesList}}</p>
                <p>被选中的节点的 key 数组: {{info.checkedKeysList}}</p>
            </div>

        </div>

    </div>
</template>

<script>
    import treeCheckbox from '../../components/tree/tree-checkbox'
    import tree from '../../components/tree/tree'

    export default {
        name: "tree-demo",
        components: {tree, treeCheckbox},
        data() {
            return {
                filterText: '',
                checkboxModel: '',
                treedata: [
                    {
                        id: '1',
                        label: '一级 1',
                        children: [
                            {id: '1-1', label: '二级 1-1', children: [{id: '1-1-1', label: '三级 1-1-1'}, {id: '1-1-2', label: '三级 1-1-2', disabled: true}]},
                            {id: '1-2', label: '二级 1-2', disabled: true, children: [{id: '1-2-1', label: '三级 1-2-1'}, {id: '1-2-2', label: '三级 1-2-2', disabled: true}]}
                        ]
                    },
                    {
                        id: '2',
                        label: '一级 2',
                        children: [
                            {id: '2-1', label: '二级 2-1', children: [{id: '2-1-1', label: '三级 2-1-1'}]},
                            {id: '2-2', label: '二级 2-2', children: [{id: '2-2-1', label: '三级 2-2-1'}, {label: '三级 2-2-2'}]},
                        ]
                    },
                ],
                defaultExpandedKeys: ['1-1', '2-1'],//默认展开的节点的 key 的数组
                currentNodeKey: '1-1',//当前选中的节点 的 id

                info: {
                    defaultCheckedKeys: ['1-1'],
                    currentNodeKey: null,
                    currentNode: {},
                    checkedNodesList: [],
                    checkedKeysList: [],

                }

            }
        },
        watch: {
            filterText(val) {
                this.$refs['cx-element-tree'].filter(val);
            }
        },
        computed: {},
        created() {

        },
        mounted() {
            this.getTreeInfo(); //获取树组件的数据
        },
        methods: {
            /**
             * 删选
             * @param value
             * @param data
             * @param node
             * @returns {boolean}
             */
            filterNode(value, data, node) {
                if (!value) return true;
                return data.label.indexOf(value) !== -1;
            },

            getTreeInfo() {
                this.info.currentNodeKey = this.$refs['cx-element-tree'].getCurrentNodeKey();
                /**
                 * 获取当前被选中节点的 data，若没有节点被选中则返回 null
                 */
                this.info.currentNode = JSON.stringify(this.$refs['cx-element-tree'].getCurrentNode(), null, 4);
            },
            changeData() {
                this.treedata = [
                    {
                        id: '1',
                        label: '一级 1',
                        children: [
                            {id: '1-1', label: '二级 1-1', children: [{id: '1-1-1', label: '三级 1-1-1'}, {id: '1-1-2', label: '三级 1-1-2', disabled: true}]},
                        ]
                    },
                    {
                        id: '2',
                        label: '一级 2',
                        children: [
                            {id: '2-1', label: '二级 2-1', children: [{id: '2-1-1', label: '三级 2-1-1'}]},
                        ]
                    },
                ];
            },
            clearData() {
                this.treedata = null;
            },
            clearData2() {
                this.treedata = [];
            },

            changeDefaultCheckedKeys() {
                this.info.defaultCheckedKeys = ['1-1', '1-1-1'];
            },
            /**
             * get checked nodes 获取目前被选中的节点所组成的数组
             * 条件 - 若节点可被选择（即 show-checkbox 为 true）
             */
            getCheckedNodes() {
                this.info.checkedNodesList = this.$refs['cx-element-tree'].getCheckedNodes();//可以不带参数，带了参数，优先级高于 checkConfig
            },

            /**
             * get checked keys - 获取目前被选中的节点的 key 所组成的数组
             * 条件 - 若节点可被选择（即 show-checkbox 为 true）
             */
            getCheckedKeys() {
                this.info.checkedKeysList = this.$refs['cx-element-tree'].getCheckedKeys(false, false);//可以不带参数，带了参数，优先级高于 checkConfig
            },


            nodeClick(data, node, components) {
                console.log('点击 node 节点');
                console.log(data);
                console.log(node);
                console.log(components);
            },

            nodeExpand(nodeData, node, components) {
                console.log('节点被展开时触发的事件 - nodeExpand');
                console.log(nodeData);
                console.log(node);
                console.log(components);

            },
            /**
             * 抛出方法 check - 当复选框被点击的时候触发
             * @param data - 传递给 data 属性的数组中该节点所对应的对象
             * @param node - 当前选择的 node 节点
             * @param obj - 树目前的选中状态对象，包含 checkedNodes、checkedKeys、halfCheckedNodes、halfCheckedKeys 四个属性
             */
            check(data, node, obj) {
                console.log('节点复选框被点击的时候触发的事件 - check');
                console.log(data);
                console.log(node);
                console.log(obj);
            },

            /**
             * 节点选中状态发生变化时的回调
             * @param data
             * @param checked
             * @param indeterminate
             */
            checkChange(data, checked, indeterminate) {
                console.log('节点选中状态发生变化时的回调 - check-change');
                console.log(data);
                console.log(checked);
                console.log(indeterminate);
            },
            /**
             * nodeContextmenu - 当某一节点被鼠标右键点击时会触发该事件
             * @param event
             * @param data
             * @param node
             * @param component
             */
            nodeContextmenu(event, data, node, component) {
                console.log('当某一节点被鼠标右键点击时会触发该事件 - node-contextmenu');
                console.log(event);
                console.log(data);
                console.log(node);
                console.log(component);
            }
        }
    }
</script>

<style lang="scss" scoped>
    .tree-demo {
        .tree-demo--text {
            margin: 20px 0;
            border-top: 1px solid silver;
            .tree-demo--text-block {
                margin: 10px 0;
                p {
                    font-size: 12px;
                }
            }
        }
    }
</style>
