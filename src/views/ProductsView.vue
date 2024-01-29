<script setup>
import Swal from 'sweetalert2'
import axios from 'axios';
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue';
const { VITE_URL, VITE_PATH } = import.meta.env;
const router = useRouter();
const products = ref([]);
const dialog = ref();
const tempProduct = ref({});
const isNew = ref(true);
function checkAdmin() {
    // 取出 token
    const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("myToken="))
        ?.split("=")[1];
    // 如果有取得 token ，放入 header
    if (token) {
        axios.defaults.headers.common["Authorization"] = token;
    }
    // 發出 check 請求，如果通過則取得產品，失敗則導回燈入頁
    axios.post(`${VITE_URL}/v2/api/user/check`)
        .then(() => {
            getProducts();
        }).catch(() => {
            Swal.fire({
                title: "請先登入",
                icon: "error",
                didClose: () => {
                    router.push("/")
                }
            })
        })
}
function getProducts() {
    axios.get(`${VITE_URL}/v2/api/${VITE_PATH}/admin/products/all`)
        .then(res => {
            products.value = res.data.products;
        })
}
function autoClose(e) {
    // 點擊 dialog 外圍區域自動關閉
    if (e.target.nodeName === "DIALOG") {
        dialog.value.close();
    }
}
function addNewProduct() {
    dialog.value.showModal();
    tempProduct.value = {};
    isNew.value = true
}
function editProduct(product) {
    tempProduct.value = JSON.parse(JSON.stringify(product));
    dialog.value.showModal();
    isNew.value = false
}
function addNewImages() {
    // 先檢查有無 imagesUrl屬性
    if (!tempProduct.value.imagesUrl) {
        tempProduct.value.imagesUrl = []
    }
    // 如果最後一個為空則不能新增圖片
    if (tempProduct.value.imagesUrl[tempProduct.value.imagesUrl.length - 1] === "") return
    tempProduct.value.imagesUrl.push("")
}
function confirmProduct() {
    // 新增用 post ，修改用 put
    if (isNew.value) {
        axios.post(`${VITE_URL}/v2/api/${VITE_PATH}/admin/product`, {
            data: tempProduct.value
        }).then(res => {
            Swal.fire({
                title: `${res.data.message}`,
                icon: "success"
            })
            dialog.value.close();
            tempProduct.value = {};
            getProducts();
        }).catch(err => {
            console.log(err)
        })
    } else {
        const { id } = tempProduct.value;
        axios.put(`${VITE_URL}/v2/api/${VITE_PATH}/admin/product/${id}`, {
            data: tempProduct.value
        })
            .then(res => {
                Swal.fire({
                    title: `${res.data.message}`,
                    icon: "success",
                })
                dialog.value.close();
                tempProduct.value = {};
                getProducts();
            }).catch(err => {
                console.log(err)
            })
    }
}
function deleteProduct(product) {
    Swal.fire({
        title: `你確定要刪除 ${product.title} 嗎?`,
        showCancelButton: true,
        confirmButtonText: "確定",
        cancelButtonText: "取消"
    }).then(result => {
        if (result.isConfirmed) {
            axios.delete(`${VITE_URL}/v2/api/${VITE_PATH}/admin/product/${product.id}`).then(res => {
                getProducts();
                Swal.fire(res.data.message);
                Swal.fire({
                    icon: "success",
                    text: res.data.message
                })
            }).catch(err => {
                Swal.fire({
                    icon: "error",
                    text: err.response.data.message
                })
            })
        }
    })
}
onMounted(() => {
    checkAdmin();
})
</script>
<template>
    <div class="container mx-a">
        <div class="text-end mt-6">
            <!-- 新增按鈕 -->
            <button type="button"
                class="bg-#0d6efd border-0 text-white cursor-pointer inline-block px-3 py-1.5 rd font-size-4 hover:bg-#0b5ed7"
                @click="addNewProduct()">建立新的產品</button>
        </div>
        <!-- 產品列表 -->
        <table class="w-100% mt-6">
            <thead class="border-b-1 border-black border-solid fw-bold text-left">
                <tr>
                    <th width="120">
                        分類
                    </th>
                    <th>產品名稱</th>
                    <th width="120" class="text-end">
                        原價
                    </th>
                    <th width="120" class="text-end">
                        售價
                    </th>
                    <th width="100" class="text-center">
                        是否啟用
                    </th>
                    <th width="120">
                        編輯
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr class="border-b border-#DEE2E6 border-solid" v-for="product in products" :key="product.id">
                    <td>{{ product.category }}</td>
                    <td>{{ product.title }}</td>
                    <td class="text-end">{{ product.origin_price }}</td>
                    <td class="text-end">{{ product.price }}</td>
                    <td class="text-center">
                        <span class="text-#198754" v-if="product.is_enabled">啟用</span>
                        <span class="text-red" v-else>未啟用</span>
                    </td>
                    <td>
                        <div class="btn-group">
                            <button type="button"
                                class="text-#0d6efd bg-transparent border-(1 #0d6efd solid r-0) rd-tl rd-bl px-2 py-1 hover:(bg-#0d6efd text-white cursor-pointer)"
                                @click="editProduct(product)">
                                編輯
                            </button>
                            <button type="button"
                                class="text-#dc3545 bg-transparent border-1 border-#de3545 border-solid rd-tr rd-br px-2 py-1 hover:(bg-#de3545 text-white cursor-pointer)"
                                @click="deleteProduct(product)">
                                刪除
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <!-- Modal -->
    <dialog ref="dialog" class="max-w-1140px w-100% border-0 rd p-0 backdrop:backdrop-blur-3" @click="autoClose">
        <form method="dialog">
            <div class="bg-#212529 p-4 flex justify-between items-center">
                <h3 class="text-white">{{ isNew ? "新增產品" : "編輯產品" }}</h3>
                <button type="button" class="i-ic:baseline-close p-2 text-white font-size-4 hover:cursor-pointer"
                    @click="dialog.close()"></button>
            </div>
            <div class="grid grid-cols-12 gap-6 p-3">
                <div class="col-span-4">
                    <div class="input-group">
                        <label for="imagUrl" class="block">主要圖片</label>
                        <input type="text" placeholder="請輸入圖片連結" v-model="tempProduct.imageUrl" class="mb-2">
                        <img :src="tempProduct.imageUrl" alt="">
                    </div>
                    <img src="" alt="">
                    <div>
                        <h4>多圖新增</h4>
                        <div v-for='(image, index) in tempProduct.imagesUrl' :key="image">
                            <div class="flex justify-between mb-2">
                                <label for="images-1">圖片網址{{ index + 1 }}</label>
                                <button
                                    class="i-ic:baseline-close font-size-5 opacity-50  hover:(cursor-pointer opacity-75)"
                                    @click="tempProduct.imagesUrl.splice(index, 1)"></button>
                            </div>
                            <div class="input-group">
                                <input type="text" v-model="tempProduct.imagesUrl[index]" placeholder="請輸入圖片網址"
                                    class=",b-2">
                            </div>
                            <img :src="image" alt="">
                        </div>
                        <button type="button"
                            class="inline-block w-100% bg-transparent border-#0d6efd border-solid border-1 rd text-#0d6efd py-1 mb-1"
                            hover="cursor-pointer bg-#0d6efd text-white" @click="addNewImages">新增圖片</button>
                    </div>
                </div>
                <div class="col-span-8">
                    <div class="grid grid-cols-2 gap-col-6 gap-row-4 ">
                        <div class="input-group  col-span-2">
                            <label for="title">標題</label>
                            <input type="text" id="title" placeholder="請輸入標題" v-model="tempProduct.title">
                        </div>
                        <div class="input-group">
                            <label for="category">分類</label>
                            <input type="text" id="category" placeholder="請輸入分類" list="categories" autocomplete="off"
                                v-model="tempProduct.category">
                            <datalist id="categories">
                                <option value="策略">策略</option>
                                <option value="派對">派對</option>
                                <option value="雙人">雙人</option>
                                <option value="陣營">陣營</option>
                                <option value="家庭">家庭</option>
                            </datalist>
                        </div>
                        <div class="input-group">
                            <label for="unit">單位</label>
                            <input type="text" id="unit" placeholder="請輸入單位" v-model="tempProduct.unit">
                        </div>
                        <div class="input-group">
                            <label for="origin_price">原價</label>
                            <input type="number" id="origin_price" placeholder="請輸入原價" min="0"
                                v-model="tempProduct.origin_price">
                        </div>
                        <div class="input-group">
                            <label for="price">售價</label>
                            <input type="number" id="price" placeholder="請輸入售價" min="0" v-model="tempProduct.price">
                        </div>
                        <div class="input-group col-span-2">
                            <label for="description">產品敘述</label>
                            <textarea name="" id="description" rows="4" v-model="tempProduct.description"></textarea>
                        </div>
                        <div class="input-group col-span-2">
                            <label for="content">說明內容</label>
                            <textarea name="" id="content" rows="4" v-model="tempProduct.content"></textarea>
                        </div>
                        <div>
                            <input type="checkbox" id="is_enabled" v-model="tempProduct.is_enabled" :true-value="1"
                                :false-value="0">
                            <label for="is_enabled">是否啟用</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="text-end p-3 border-(t solid #dee2e6)">
                <button type="button"
                    class="m-1 px-3 py-1.5 bg-transparent text-#6c757d border-(1 solid #6c757d ) rd hover:(cursor-pointer bg-#5c636a text-white)"
                    @click="dialog.close()">取消</button>
                <button type="button"
                    class="m-1 px-3 py-1.5 text-white bg-#0d6efd border-0 rd hover:(cursor-pointer bg-#0b5ed7)"
                    @click="confirmProduct()">確定</button>
            </div>
        </form>
    </dialog>
</template>
<style scoped lang="postcss">
td,
th {
    padding: 8px;
}

.input-group {
    label {
        @apply mb-2 block
    }

    input, textarea {
        --at-apply: w-100% rd border-1 border-solid px-3 py-1.5 font-size-4 focus:(outline-0 border-#86b7fe border-solid shadow-[0px_0px_0px_0.25rem_#C2DBFE])
    }
}</style>