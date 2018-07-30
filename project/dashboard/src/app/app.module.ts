import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app.routing';
import {CreateProductComponent} from "./components/createProduct/createProduct.component";
import {NavbarComponent} from "./components/navbar/navbar.component";
import {CreateMultisigAccountComponent} from "./components/createMultisigAccount/createMultisigAccount.component";
import {ProductDetailComponent} from "./components/productDetail/productDetail.component";
import {SendSafetySealComponent} from "./components/sendSafetySeal/sendSafetySeal.component";
import {ProductService} from "./services/product.service";
import {MultisigService} from "./services/multisig.service";
import {TransactionService} from "./services/transaction.service";
import {SafetySealService} from "./services/safetySeal.service";
import {FormatTransactionPipe} from "./pipes/formatTransactions.pipe";
import {ProductDeterministicPublicAccountPipe} from "./pipes/productDeterministicPublicAccount.pipe";
@NgModule({
  declarations: [
    AppComponent,
    CreateProductComponent,
    SendSafetySealComponent,
    NavbarComponent,
    CreateMultisigAccountComponent,
    ProductDetailComponent,
    FormatTransactionPipe,
    ProductDeterministicPublicAccountPipe,
  ],
  imports: [
    BrowserModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [ProductService, SafetySealService, MultisigService, TransactionService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
