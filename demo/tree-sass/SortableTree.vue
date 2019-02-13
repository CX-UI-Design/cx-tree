<template>
	<div class="sortable-tree" :draggable="draggable && parentData" @dragstart.stop="dragStart($event)" @dragenter.stop.prevent="dragEnter()" @dragleave.stop="dragLeave()" @drop.stop.prevent="drop" @dragend.stop.prevent="dragEnd">
		<div class="content">
			<slot :item="data" :parent="parent">
				<span>{{data[attr]}}</span>
			</slot>
		</div>
		<ul v-if="hasChildren(data) && (!this.closeStateKey || this.closeStateKey && !this.data[this.closeStateKey])">
			<li v-for="(item, index) in children" :idTree="index" :class="{'parent-li': hasChildren(item), 'exist-li': !item['_replaceLi_'], 'blank-li': item['_replaceLi_']}">
				<sortable-tree :data="item" :parent="data" :attr="attr" :childrenAttr="childrenAttr"
							   :mixinParentKey="mixinParentKey" :closeStateKey="closeStateKey" :draggable="draggable"
							   :parentData="data" :idx="index" :dragInfo="dragInfo" @changePosition="changePosition">
					<template slot-scope="{item: item, parent: parent}">
						<slot :item="item" :parent="parent">
							<span>{{item[attr]}}</span>
						</slot>
					</template>
				</sortable-tree>
			</li>
		</ul>
	</div>
</template>

<script>
	import Vue from 'vue'
	export default {
		name: 'SortableTree',
		props: {
			data: {
				type: Object
			},
      parent: Object,
			attr: {
				type: Object,
			},
			idTree: {
				type: Number,
				default: -1
			},
			closeStateKey: {
				type: String,
				default: ''
			},
			childrenAttr: {
				type: String,
				default: 'children'
			},
			mixinParentKey: {
				type: String,
				default: ''
			},
			draggable: {
				type: Boolean,
				default: true
			},
			// inner used from here
			parentData: {
				type: Object
			},
			idx: {
				type: Number, // v-for 的索引，用于相邻节点的判别
				default: -1
			},
			dragInfo: {
				type: Object,
				default: () => {
					return {
						data: null, // vm 的数据
						vm: null, // 被拖动组件
						vmIdx: -1,
						parentData: null // vm 的容器数据
					}
				}
			}
		},
		data() {
			return {
				dragObj: this.dragInfo
			}
		},
		computed: {
			children() {
				// 举例：原本是 [N1, N2, N3]
				let children = this.data[this.childrenAttr]
				if(!children || !children.length) return []

				let _children = []
				children.forEach(child => _children.push({
					_replaceLi_: true
				}, child))
				_children.push({
					_replaceLi_: true
				})

				// 最后生成 [E1, N1, E2, N2, E3, N3, E4]（其中 N 表示节点，E 表示空节点）
				return _children
			},
			isParent() { // 拖放限制 1：判断“我”是否为被拖动节点的父节点
				return this.data === this.dragObj.parentData
			},
			isNextToMe() { // 拖放限制 2：判断“我”是否为被拖动节点的相邻节点
				return this.parentData === this.dragObj.parentData && Math.abs(this.idx - this.dragObj.vmIdx) === 1
			},
			isMeOrMyAncestor() { // 判断被拖动节点是否为“我”自身或“我”的祖先
				//      let data = this.data
				let parent = this
				while(parent) {
					let data = parent.data
					if(data === this.dragObj.data) {
						return true
					}
					parent = parent.$parent
				}
				return false
			},
			isAllowToDrop() { // 上述拖放限制条件的综合
				return !(this.isNextToMe || this.isParent || this.isMeOrMyAncestor)
			}
		},
		methods: {
			changePosition(opts) {
				this.$emit('changePosition', opts)
			},
			hasChildren(item) {
				return item[this.childrenAttr] && item[this.childrenAttr].length
			},
			dragStart(event) { // 被拖动元素
				if(this.data['_replaceLi_']) { // 空元素不允许拖动
					return event.preventDefault()
				}
				// support firfox ..
				event.dataTransfer.setData('text/plain', null)

				this.dragObj.data = this.data
				this.dragObj.vm = this.$el
				this.dragObj.vmIdx = this.idx
				this.dragObj.parentData = this.parentData
			},
			dragEnter() { // 作用在目标元素
				this.dragObj.vm.classList.add('draging')
				if(!this.isAllowToDrop) return
				this.$el.classList.add('droper')
			},
			dragLeave(data) { // 作用在目标元素
				this.$el.classList.remove('droper')
			},
			// 在ondragover中一定要执行preventDefault()，否则ondrop事件不会被触发。
			drop() { // 目标元素
				this.dragObj.vm.classList.remove('draging')
				this.$el.classList.remove('droper')
				if(!this.isAllowToDrop) return
				// 无论如何都直接删除被拖动节点
				let index = this.dragObj.parentData[this.childrenAttr].indexOf(this.dragObj.data)
				this.dragObj.parentData[this.childrenAttr].splice(index, 1)
				// 拖入空节点，成其兄弟（使用 splice 插入节点）
				let afterParent = this.parentData
				if(this.data['_replaceLi_']) {
					this.parentData[this.childrenAttr].splice(this.idx / 2, 0, this.dragObj.data)
				} else {
					afterParent = this.data
					// 拖入普通节点，成为其子
					if(!this.data[this.childrenAttr]) {
						Vue.set(this.data, [this.childrenAttr], [])
					} // 须用 $set 引入双向绑定
					this.data[this.childrenAttr].push(this.dragObj.data)
				}
				this.$emit('changePosition', {
					beforeParent: this.dragObj.parentData,
					data: this.dragObj.data,
					afterParent: afterParent
				})
			},
			dragEnd() {},
		},
		updated() {
			if(this.mixinParentKey) {
				this.data[this.mixinParentKey] = this.parentData
			}
		},
		mounted() {
			if(this.mixinParentKey) {
				this.data[this.mixinParentKey] = this.parentData;
			}
		}
	}
</script>
<style>
	ul :not(.parent-li).exist-li:nth-last-child(2):before {
		width: 24px;
		height: 58% !important; // 32为1个li的高度
		left: 4.5px;
		top: -2px;
		border-left: 1px dashed #d8d8d8;
	}
</style>
<style lang="scss" scoped>
	$content-height: 16px;
	$drag-height: 24px;
	$after-top: 13px;
	$blank-li-height: 5px;
	.sortable-tree {
		font-size: 14px !important;
		color: #666666;
		.content {
			position: relative;
			line-height: $content-height;
			user-select: none;
			font-size: 14px !important;
		}
		.blank-li {
			.content {
				width: 0;
				height: 0;
				overflow: hidden;
			}
			.sortable-tree {
				height: 5px;
			}
		}
		ul,
		li {
			margin: 0;
			padding: 0;
		}
		ul {
			position: relative;
			display: list-item;
			list-style: none;
			&:empty {
				width: 0;
				height: 0;
			}
		}
		li {
			position: relative;
			padding-left: 17px;
		}
	}
	/* 位置相关 */

	.sortable-tree {
		li {
			position: relative;
			&:before,
			&:after {
				position: absolute;
				content: '';
			}
			&:before {
				width: 24px;
				height: 100%;
				left: 12px;
				top: -5px;
				margin: auto;
				border-left: 1px dashed #d8d8d8;
			}
			&:after {
				width: 10px;
				top: $after-top;
				left: 13px;
				border-top: 1px dashed #d8d8d8;
			}
			&.parent-li:nth-last-child(2):before {
				width: 24px;
				height: 16px; // 32为1个li的高度
				left: 12px;
				top: -2.5px;
				border-left: 1px dashed #d8d8d8;
			}
			&.blank-li {
				padding: 0;
				width: 100%;
				height: $blank-li-height;
				&:after {
					width: 0;
				}
				&:last-child {
					height: 0;
				}
			}
		}
	}

	// 拖动相关
	/*.draging {
		background: #f2f2f2;
	}*/

	.droper {
		background: #f2f2f2;
	}
</style>
