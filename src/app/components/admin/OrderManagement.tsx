"use client";

import { useState } from "react";
import { Order, OrderStatus, ORDER_STATUSES } from "../../../types/order";
import { useTranslations } from "../../../lib/translations";

interface OrderManagementProps {
  orders: Order[];
  filteredOrders: Order[];
  orderSearchTerm: string;
  setOrderSearchTerm: (term: string) => void;
  orderStatusFilter: string;
  setOrderStatusFilter: (filter: string) => void;
  updatingOrderStatus: string | null;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export default function OrderManagement({
  orders,
  filteredOrders,
  orderSearchTerm,
  setOrderSearchTerm,
  orderStatusFilter,
  setOrderStatusFilter,
  updatingOrderStatus,
  updateOrderStatus
}: OrderManagementProps) {
  const { t } = useTranslations();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = selectedOrderId
    ? orders.find((order) => order.id === selectedOrderId) ?? null
    : null;

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return t("admin.orderManagement.statusPending");
      case "processing":
        return t("admin.orderManagement.statusProcessing");
      case "shipped":
        return t("admin.orderManagement.statusShipped");
      case "delivered":
        return t("admin.orderManagement.statusDelivered");
      case "cancelled":
        return t("admin.orderManagement.statusCancelled");
      default:
        return status;
    }
  };

  const getDeliveryMethodText = (method?: string) => {
    switch (method) {
      case "express":
        return t("orderConfirmation.deliveryExpress");
      case "standard":
        return t("orderConfirmation.deliveryStandard");
      default:
        return t("admin.orderManagement.notSpecified");
    }
  };

  const getPaymentMethodText = (method?: string) => {
    switch (method) {
      case "cardOnDelivery":
        return t("orderConfirmation.paymentCard");
      case "cashOnDelivery":
        return t("orderConfirmation.paymentCash");
      default:
        return t("admin.orderManagement.notSpecified");
    }
  };

  const formatMoney = (value: number) =>
    value.toLocaleString("ru-RU", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderStatusSelect = (order: Order, compact = false) => (
    <select
      value={order.status}
      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
      disabled={updatingOrderStatus === order.id}
      className={`${compact ? "w-full" : ""} text-sm border border-white/10 rounded px-2 py-1 bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50`}
    >
      {ORDER_STATUSES.map(status => (
        <option key={status} value={status}>{getStatusText(status)}</option>
      ))}
    </select>
  );

  return (
    <>
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">
              {t("admin.orderManagement.searchOrders")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={t("admin.orderManagement.searchPlaceholder")}
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-md leading-5 bg-[var(--card)] text-[var(--foreground)] placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="md:w-48">
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">
              {t("admin.orderManagement.filterByStatus")}
            </label>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-white/10 rounded-md leading-5 bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t("admin.orderManagement.allStatuses")}</option>
              {ORDER_STATUSES.map(status => (
                <option key={status} value={status}>{getStatusText(status)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-[var(--muted)]">
          {t("admin.orderManagement.showingResults", { filtered: filteredOrders.length, total: orders.length })}
        </div>
      </div>

      <div className="card p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-[var(--card)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  {t("admin.orderManagement.orderId")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  {t("admin.orderManagement.client")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  {t("admin.orderManagement.items")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  {t("admin.orderManagement.fulfillment")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  {t("admin.orderManagement.amount")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  {t("admin.orderManagement.status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  {t("admin.orderManagement.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--card)] divide-y divide-white/10">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <p className="text-lg font-medium text-[var(--foreground)] mb-2">{t("admin.orderManagement.noOrdersFound")}</p>
                      <p className="text-[var(--muted)]">
                        {orderSearchTerm || orderStatusFilter !== "all"
                          ? t("admin.userManagement.tryDifferentSearch")
                          : t("admin.orderManagement.ordersWillAppearHere")
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderId(order.id)}
                        className="font-medium text-[var(--accent)] hover:text-[var(--accent)]/80"
                      >
                        #{order.id.substring(0, 8)}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-[var(--foreground)]">
                          {order.customerName}
                        </div>
                        <div className="text-sm text-[var(--muted)]">
                          {order.customerEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--foreground)]">
                        {order.items.length} {t("admin.orderManagement.items")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[var(--foreground)]">{getDeliveryMethodText(order.deliveryMethod)}</div>
                      <div className="text-xs text-[var(--muted)]">{getPaymentMethodText(order.paymentMethod)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[var(--foreground)]">
                        {formatMoney(order.totalAmount)}
                      </div>
                      {(order.deliveryFee ?? 0) > 0 && (
                        <div className="text-xs text-[var(--muted)]">
                          {t("admin.orderManagement.deliveryFee")}: {formatMoney(order.deliveryFee ?? 0)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderId(order.id)}
                          className="px-3 py-1.5 rounded-md bg-white/10 text-[var(--foreground)] hover:bg-white/15 transition-colors"
                        >
                          {t("admin.orderManagement.viewDetails")}
                        </button>
                        {renderStatusSelect(order)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg border border-white/10 bg-[var(--background)] shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
              <div>
                <p className="text-sm text-[var(--muted)]">{t("admin.orderManagement.orderId")}</p>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">#{selectedOrder.id.substring(0, 8)}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {new Date(selectedOrder.createdAt).toLocaleString("ru-RU")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="rounded-md p-2 text-[var(--muted)] hover:bg-white/10 hover:text-[var(--foreground)]"
                aria-label={t("admin.orderManagement.close")}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid gap-4 p-5 lg:grid-cols-2">
              <section className="rounded-lg bg-white/5 p-4">
                <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
                  {t("admin.orderManagement.customerDetails")}
                </h3>
                <div className="space-y-3 text-sm">
                  <DetailRow label={t("orderConfirmation.customerName")} value={selectedOrder.customerName} />
                  <DetailRow label={t("orderConfirmation.customerEmail")} value={selectedOrder.customerEmail} />
                  <DetailRow label={t("admin.orderManagement.phone")} value={selectedOrder.customerPhone || t("admin.orderManagement.notSpecified")} />
                  <DetailRow label={t("admin.orderManagement.shippingAddress")} value={selectedOrder.shippingAddress} />
                  {selectedOrder.notes && (
                    <DetailRow label={t("admin.orderManagement.notes")} value={selectedOrder.notes} />
                  )}
                </div>
              </section>

              <section className="rounded-lg bg-white/5 p-4">
                <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
                  {t("admin.orderManagement.fulfillment")}
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="mb-1 text-xs uppercase text-[var(--muted)]">{t("admin.orderManagement.status")}</p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <span className={`inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                      {renderStatusSelect(selectedOrder, true)}
                    </div>
                  </div>
                  <DetailRow label={t("admin.orderManagement.delivery")} value={getDeliveryMethodText(selectedOrder.deliveryMethod)} />
                  <DetailRow label={t("admin.orderManagement.payment")} value={getPaymentMethodText(selectedOrder.paymentMethod)} />
                  <DetailRow label={t("admin.orderManagement.paymentStatus")} value={selectedOrder.paymentStatus || t("admin.orderManagement.notSpecified")} />
                </div>
              </section>
            </div>

            <div className="px-5 pb-5">
              <section className="rounded-lg bg-white/5 p-4">
                <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
                  {t("admin.orderManagement.orderItems")}
                </h3>
                <div className="divide-y divide-white/10">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="grid gap-3 py-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{item.bookTitle}</p>
                        <p className="text-sm text-[var(--muted)]">
                          {item.quantity} x {formatMoney(item.unitPrice)}
                        </p>
                      </div>
                      <p className="text-sm text-[var(--muted)]">
                        {t("admin.orderManagement.quantity")}: {item.quantity}
                      </p>
                      <p className="font-semibold text-[var(--foreground)]">{formatMoney(item.totalPrice)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-white/10 pt-4">
                  <div className="ml-auto max-w-sm space-y-2 text-sm">
                    <SummaryRow
                      label={t("admin.orderManagement.subtotal")}
                      value={formatMoney(selectedOrder.totalAmount - (selectedOrder.deliveryFee ?? 0))}
                    />
                    <SummaryRow
                      label={t("admin.orderManagement.deliveryFee")}
                      value={(selectedOrder.deliveryFee ?? 0) > 0 ? formatMoney(selectedOrder.deliveryFee ?? 0) : t("orderConfirmation.free")}
                    />
                    <SummaryRow
                      label={t("admin.orderManagement.total")}
                      value={formatMoney(selectedOrder.totalAmount)}
                      strong
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="flex justify-end border-t border-white/10 p-5">
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="rounded-md bg-[var(--accent)] px-4 py-2 font-medium text-white hover:bg-[var(--accent)]/80"
              >
                {t("admin.orderManagement.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${strong ? "text-base font-bold text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
      <span>{label}</span>
      <span className={strong ? "text-[var(--foreground)]" : "text-[var(--foreground)]"}>{value}</span>
    </div>
  );
}
