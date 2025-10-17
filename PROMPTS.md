TODO:
store-template/
├── src/
│ ├── app/
│ │ ├── (main)/
│ │ │ ├── cart/
│ │ │ │ ├── loading.tsx
│ │ │ │ ├── page.tsx
│ │ │ ├── checkout/
│ │ │ │ ├── page.tsx
│ │ │ │ ├── [success]/
│ │ │ │ │ ├── [orderId]/
│ │ │ │ │ │ ├── loading.tsx
│ │ │ │ │ │ ├── page.tsx
│ │ │ ├── layout.tsx
│ │ │ ├── page.tsx
│ │ │ ├── products/
│ │ │ │ ├── loading.tsx
│ │ │ │ ├── page.tsx
│ │ │ │ ├── [slug]/
│ │ │ │ │ ├── error.tsx
│ │ │ │ │ ├── loading.tsx
│ │ │ │ │ ├── page.tsx
│ │ ├── admin/
│ │ │ ├── orders/
│ │ │ │ ├── page.tsx
│ │ │ │ ├── [id]/
│ │ │ │ │ ├── page.tsx
│ │ │ ├── page.tsx
│ │ ├── api/
│ │ ├── error.tsx
│ │ ├── favicon.ico
│ │ ├── globals.css
│ │ ├── layout.tsx
│ │ ├── loading.tsx
│ │ ├── not-found.tsx
│ ├── components/
│ │ ├── admin/
│ │ │ ├── orders/
│ │ │ │ ├── AdminOrdersClient.tsx
│ │ │ │ ├── CustomerInfoCard.tsx
│ │ │ │ ├── OrderActionsDropdown.tsx
│ │ │ │ ├── OrderDetails.tsx
│ │ │ │ ├── OrderItemsCard.tsx
│ │ │ │ ├── OrderOverviewCard.tsx
│ │ │ │ ├── OrdersSearchFilter.tsx
│ │ │ │ ├── OrdersTable.tsx
│ │ │ │ ├── PaymentInfoCard.tsx
│ │ ├── cart/
│ │ │ ├── CartItem.tsx
│ │ │ ├── CartItems.tsx
│ │ │ ├── CartSummary.tsx
│ │ ├── checkout/
│ │ │ ├── CheckoutClient.tsx
│ │ │ ├── CheckoutForm.tsx
│ │ │ ├── CheckoutSuccessActions.tsx
│ │ │ ├── CheckoutSuccessHeader.tsx
│ │ │ ├── NextSteps.tsx
│ │ │ ├── OrderDetails.tsx
│ │ │ ├── OrderSummary.tsx
│ │ │ ├── OrderSummarySidebar.tsx
│ │ │ ├── PayPalPaymentSection.tsx
│ │ │ ├── StockWarning.tsx
│ │ ├── layout/
│ │ │ ├── CartBadge.tsx
│ │ │ ├── Footer.tsx
│ │ │ ├── MobileMenu.tsx
│ │ │ ├── Navbar.tsx
│ │ │ ├── NavLinks.tsx
│ │ ├── modals/
│ │ │ ├── ConfrimActionModal.tsx
│ │ │ ├── StockConfirmationModal.tsx
│ │ ├── product/
│ │ │ ├── AddToCartButton.tsx
│ │ │ ├── ProductCard.tsx
│ │ │ ├── ProductImageGallery.tsx
│ │ │ ├── RelatedProducts.tsx
│ │ ├── providers/
│ │ │ ├── ModalProvider.tsx
│ │ │ ├── Providers.tsx
│ │ │ ├── QueryProvider.tsx
│ │ ├── shared/
│ │ │ ├── ActionsDropdown.tsx
│ │ │ ├── Badge.tsx
│ │ │ ├── Breadcrumb.tsx
│ │ │ ├── ConfirmDialog.tsx
│ │ │ ├── EmptyState.tsx
│ │ │ ├── ErrorMessage.tsx
│ │ │ ├── FilterSelect.tsx
│ │ │ ├── FormCard.tsx
│ │ │ ├── ImagePlaceholder.tsx
│ │ │ ├── LoadingSpinner.tsx
│ │ │ ├── OrderBadges.tsx
│ │ │ ├── PageHeader.tsx
│ │ │ ├── Pagination.tsx
│ │ │ ├── SearchFilter.tsx
│ │ ├── temp/
│ │ ├── ui/
│ │ │ ├── badge.tsx
│ │ │ ├── button.tsx
│ │ │ ├── card.tsx
│ │ │ ├── carousel.tsx
│ │ │ ├── dialog.tsx
│ │ │ ├── dropdown-menu.tsx
│ │ │ ├── input.tsx
│ │ │ ├── label.tsx
│ │ │ ├── select.tsx
│ │ │ ├── separator.tsx
│ │ │ ├── sheet.tsx
│ │ │ ├── sidebar.tsx
│ │ │ ├── skeleton.tsx
│ │ │ ├── sonner.tsx
│ │ │ ├── switch.tsx
│ │ │ ├── table.tsx
│ │ │ ├── textarea.tsx
│ │ │ ├── tooltip.tsx
│ ├── constants/
│ │ ├── payment.ts
│ │ ├── selectOptions.ts
│ │ ├── stock.ts
│ ├── hooks/
│ │ ├── use-debounce.ts
│ │ ├── use-hydration.ts
│ │ ├── use-mobile.ts
│ │ ├── use-order-actions.ts
│ │ ├── use-product-stock.ts
│ ├── lib/
│ │ ├── actions/
│ │ │ ├── checkoutAction.ts
│ │ │ ├── paymentActions.ts
│ │ │ ├── productActions.ts
│ │ ├── images.ts
│ │ ├── orders.ts
│ │ ├── prisma.ts
│ │ ├── products.ts
│ │ ├── reactQuery.ts
│ │ ├── upload.ts
│ │ ├── utils.ts
│ ├── middleware.ts
│ ├── schemas/
│ │ ├── checkoutSchema.ts
│ │ ├── productSchema.ts
│ ├── services/
│ │ ├── payment/
│ │ │ ├── core/
│ │ │ │ ├── PaymentConfig.ts
│ │ │ │ ├── PaymentProvider.ts
│ │ │ │ ├── PaymentResult.ts
│ │ │ ├── factories/
│ │ │ │ ├── PaymentProviderFactory.ts
│ │ │ ├── PaymentService.ts
│ │ │ ├── paypal-service.ts
│ │ │ ├── providers/
│ │ │ │ ├── PayPalProvider.ts
│ │ ├── s3.ts
│ ├── store/
│ │ ├── cartStore.ts
│ │ ├── modalStore.ts
│ ├── types/
│ │ ├── cart.ts
│ │ ├── common.ts
│ │ ├── modals.ts
│ │ ├── order.ts
│ │ ├── payment.ts
│ │ ├── product.ts
│ │ ├── stock.ts
│ ├── utils/
│ │ ├── adminUtils.ts
│ │ ├── currencyUtils.ts
│ │ ├── errorUtils.ts
│ │ ├── orderUtils.ts
│ │ ├── paginationUtils.ts
│ │ ├── priceUtils.ts
│ │ ├── productUtils.ts
│ │ ├── time.ts
├── tsconfig.json
