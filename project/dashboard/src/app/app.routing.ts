import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CreateProductComponent} from "./components/createProduct/createProduct.component";
import {CreateMultisigAccountComponent} from "./components/createMultisigAccount/createMultisigAccount.component";
import {ProductDetailComponent} from "./components/productDetail/productDetail.component";
import {SendSafetySealComponent} from "./components/sendSafetySeal/sendSafetySeal.component";


const routes: Routes = [
  {
    path: 'multisig-service',
    component: CreateMultisigAccountComponent
  },
  {
    path: 'send-safety-seal',
    component: SendSafetySealComponent
  },
  {
    path: 'product/:id',
    component: ProductDetailComponent
  },
  {
    path: '',
    component: CreateProductComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {
}
