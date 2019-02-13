<template>
    <div class="cx-tree-node"
         v-show="node.visible"
         :class="{
              'is-expanded': expanded,
              'is-current': tree.store.currentNode === node,
              'is-abled': !node.disabled,
              'is-hidden': !node.visible,
          }"
         role="tree-node"

         :aria-disabled="node.disabled"
         @click.stop="handleClick"
         @contextmenu="($event) => this.handleContextMenu($event)"
    >
        <!--该节点-->
        <div class="cx-tree-node__content"
             :style="{ 'padding-left': (node.level - 1) * tree.indent + 'px' }">
            <!--节点图标-->
            <span
                    @click.stop="handleExpandIconClick"
                    :class="[
                          { 'is-leaf': node.isLeaf, expanded: !node.isLeaf && expanded },
                          'cx-element-tree-node__expand-icon',
                          tree.iconClass ? tree.iconClass : 'cx-icon-caret-right'
                        ]">
                </span>
            <!--选择框-->
            <tree-checkbox
                    v-if="showCheckbox"
                    v-model="node.checked"
                    :indeterminate="node.indeterminate"
                    :disabled="!!node.disabled"
                    @click.native.stop
                    @change="handleCheckChange"
            >
            </tree-checkbox>
            <span>{{node.label}}</span>

        </div>
        <!--子节点-->
        <div
                class="cx-tree-node__children"
                v-if="!renderAfterExpand || childNodeRendered"
                v-show="expanded"
                role="group"
                :style="{ 'padding-left': 20 + 'px' }"
        >
            <CX-tree-node
                    v-for="(child,index) in node.childNodes"
                    :node="child"
                    :key="index"
                    :branchID="index + 1"
                    @node-expand="handleChildNodeExpand"
            ></CX-tree-node>
        </div>
    </div>
</template>

<script>
    import treeCheckbox from './tree-checkbox';
    import Emitter from './mixins/emitter';

    export default {
        name: 'CXTreeNode',

        componentName: 'CXTreeNode',//非常关键 在emitter 中需要获取到

        mixins: [Emitter],
        components: {treeCheckbox},
        props: {
            node: {
                default() {
                    return {};
                }
            },
            props: {},
            branchID: {type: [String, Number]},
        },
        data() {
            return {
                tree: {},
                store: null,
                expanded: false,
                childNodeRendered: false,//子树节点渲染开关

                defalutChecked: null,//初始默认 checked 状态
                defalutIndeterminate: null,//初始默认 indeterminate 状态

                showCheckbox: false,//节点是否可被选择(显示多选框)
            }
        },
        computed: {
            //是否在第一次展开某个树节点后才渲染其子节点
            renderAfterExpand() {
                return this.tree.renderAfterExpand;
            }
        },
        watch: {
            'node.indeterminate'(val) {
                this.handleSelectChange(this.node.checked, val);
            },

            'node.checked'(val) {
                this.handleSelectChange(val, this.node.indeterminate);
            },
            'node.expanded'(val) {
                console.log('node 节点被点击操作 - node 信息中的 expanded 值发生变化');
                this.$nextTick(() => this.expanded = val);
                if (val) {
                    console.log('监听 expanded 的 值：', val);
                    this.childNodeRendered = true;
                }

            }
        },
        created() {
            this.createdTree();

            const tree = this.tree;
            if (!tree) {
                console.warn('Can not find node\'s element-tree.');
            }
            this.showCheckbox = tree.showCheckbox;
            /**
             * 只要在 当前节点 被点击打开时，才会同步更新状态值，并渲染子节点组件( 需和 renderAfterExpand 状态值 共同影响决定 )
             * 当前节点 expanded 状态值为 true 时，同步更新 此组件中的expanded 和 childNodeRendered
             */
            if (this.node.expanded) {
                this.expanded = true;
                this.childNodeRendered = true;
            }

            /**
             * 手风琴模式下，需要对 element-tree-node-expand 事件回抛进行接收，并进行相应操作：
             * 1、判断节点 node - branchID 字段值（ 只会在同级进行判断，不会延伸到自级或者父级 ）
             * 2、关闭branchID字段值不对应的节点
             */
            if (this.tree.accordion) {
                this.$on('element-tree-node-expand', node => {
                    console.log('当前手风琴模式：对 element-tree-node-expand 事件回抛进行接收，判断 节点 node - branchID字段值，并关闭不对应的节点');
                    //判断 接收 element-tree-node-expand 事件所对应的参数node 是否 为当前节点node
                    if (this.node.branchID !== node.branchID) {
                        this.node.collapse();
                    }
                });
            }

            //创建该 node 节点 的唯一 ID （ 在组件中默认添加的身份标识，没有任何业务属性，和用户添加的id值有所区分，纯粹是服务于组件本身 )
            this.node.createBranchID(this.branchID);

        },
        methods: {
            createdTree() {
                const parent = this.$parent;

                /**
                 * 第一层循环时，node-element-tree 的父组件 还是 最外层的 cx-element-tree （通过判断 是否有 isCXTree 字段值)
                 * 之后，每一层的父组件都是上一层的 node-element-tree， 自己再做递归
                 * 所取到的tree字段也是其父组件的tree
                 */
                if (parent.isCXTree) {
                    this.tree = parent;
                } else {
                    this.tree = parent.tree;
                }
            },

            /**
             * handleContextMenu - 当某一节点被鼠标右键点击时会触发该事件
             * @param event
             */
            handleContextMenu(event) {
                if (this.tree._events['node-contextmenu'] && this.tree._events['node-contextmenu'].length > 0) {
                    event.stopPropagation();//阻止事件进一步冒泡，进而被其他节点接收
                    event.preventDefault();//阻止事件默认的动作，但是并不会阻止事件的继续传播
                }
                this.tree.$emit('node-contextmenu', event, this.node.data, this.node, this);
            },

            handleClick() {
                console.log('handleClick')
                const store = this.tree.store;
                console.log(store)
                console.log(this);

                store.setCurrentNode(this.node);//设置当前节点

                store.setCurrentNodeKey(this.node);//设置当前节点key

                store.deregisterNode(this.node);//del

                /**
                 * 当前选中节点变化时触发的事件
                 * 共两个参数，依次为：当前节点的数据，当前节点的 Node 对象
                 */
                this.tree.$emit('current-change', store.currentNode ? store.currentNode.data : null, store.currentNode);


                this.tree.currentNode = this;//将当前节点组件


                //在点击 Node 节点的时候（该节点不为禁用)，展开或者收缩节点
                if (this.tree.isExpandByClickNode) {
                    this.handleExpandIconClick();
                }
                //在点击 Node 节点的时候（该节点不为禁用)，同步选中多选框
                if (this.tree.checkOnClickNode && !this.node.disabled && this.showCheckbox) {
                    this.handleCheckChange(null, {
                        target: {checked: !this.node.checked}
                    });
                }

                this.tree.$emit('node-click', this.node.data, this.node, this);//点击 node 节点  -  抛出
            },


            //点击收起的图标
            handleExpandIconClick() {
                if (this.node.isLeaf) return;
                if (this.expanded) {
                    this.tree.$emit('node-collapse', this.node.data, this.node, this);//节点收起事件  -  抛出
                    this.node.collapse();//收起
                } else {
                    console.log('当前节点的 node 信息');
                    console.log(this.node);

                    this.node.expand();//打开
                    console.log(this.expanded);
                    this.$emit('node-expand', this.node.data, this.node, this);//节点展开事件 -  抛出
                }
            },

            /**
             * 内层  子树组件 展开节点
             * @param nodeData
             * @param node
             * @param instance
             */
            handleChildNodeExpand(nodeData, node, instance) {
                /**
                 * 事件广播
                 * 需要传入 组件名称  事件名称 当前节点node信息对象
                 */
                this.broadcast('CXTreeNode', 'element-tree-node-expand', node);
                this.tree.$emit('node-expand', nodeData, node, instance);
            },


            /**
             * 节点选择操作
             * @param checked
             * @param indeterminate
             */
            handleSelectChange(checked, indeterminate) {
                //节点选中状态发生变化时的回调
                //共三个参数，依次为：传递给 data 属性的数组中该节点所对应的对象、节点本身是否被选中、节点的子树中是否有被选中的节点
                if (this.defalutChecked !== checked && this.defaluIndeterminate !== indeterminate) {
                    this.tree.$emit('check-change', this.node.data, checked, indeterminate);
                }
                this.defalutChecked = checked;
                // this.indeterminate = indeterminate;
            },


            /**
             * 节点多选框选择操作
             * @param value
             * @param ev
             */
            handleCheckChange(value, ev) {
                this.node.setChecked(ev.target.checked, !this.tree.checkStrictly);
                const store = this.tree.store;

                //synchronized change checkedModel - 同步改变checkedKeysStore,激活计算属性，继而输出目标值（选中的节点key数组，用于tree v-model）
                this.tree.checkedKeysStore = store.getCheckedKeys(this.tree.mixinCheckConfig);

                //在数据变化后要执行的某个操作，而这个操作需要使用随数据改变而改变的DOM结构的时候，这个操作都应该放进Vue.nextTick()的回调函数中。
                this.$nextTick(() => {
                    /**
                     * 抛出方法 check - 当复选框被点击的时候触发
                     * 共三个参数，依次为：
                     * 1、传递给 data 属性的数组中该节点所对应的对象
                     * 2、当前选择的 node 节点
                     * 3、树目前的选中状态对象，包含 checkedNodes、checkedKeys、halfCheckedNodes、halfCheckedKeys 四个属性
                     */
                    this.tree.$emit('check', this.node.data, this.node, {
                        checkedNodes: store.getCheckedNodes(this.tree.mixinCheckConfig),//获取目前被选中的节点所组成的数组
                        checkedKeys: this.tree.checkedKeysStore,//获取目前被选中的节点的 key 所组成的数组
                        halfCheckedNodes: store.getHalfCheckedNodes(),//获取目前半选中的节点所组成的数组
                        halfCheckedKeys: store.getHalfCheckedKeys(),//获取目前半选中的节点的 key 所组成的数组
                    });
                });
            },
        }
    }
</script>

<style scoped>

</style>
