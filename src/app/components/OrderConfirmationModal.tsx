"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../auth-context";
import { useCart } from "../cart-context";
import { useTranslations } from "../../lib/translations";
import { localizeBook } from "../../lib/localized-book";
import type { Book } from "../../types/book";

type CheckoutStep = "details" | "options" | "review" | "processing" | "success";
type DeliveryMethod = "standard" | "express";
type PaymentMethod = "cashOnDelivery" | "cardOnDelivery";

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  totalAmount: number;
  totalItems: number;
  books: Book[];
}

export default function OrderConfirmationModal({
  isOpen,
  onClose,
  onSuccess,
  totalAmount,
  totalItems,
  books
}: OrderConfirmationModalProps) {
  const { token, checkAndRefreshToken, userInfo } = useAuth();
  const { state, clear } = useCart();
  const { t, language } = useTranslations();
  const [step, setStep] = useState<CheckoutStep>("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cashOnDelivery");
  const [notes, setNotes] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const deliveryOptions: Array<{ id: DeliveryMethod; price: number; title: string; description: string }> = [
    {
      id: "standard",
      price: 0,
      title: t("orderConfirmation.deliveryStandard"),
      description: t("orderConfirmation.deliveryStandardDescription"),
    },
    {
      id: "express",
      price: 4.99,
      title: t("orderConfirmation.deliveryExpress"),
      description: t("orderConfirmation.deliveryExpressDescription"),
    },
  ];

  const paymentOptions: Array<{ id: PaymentMethod; title: string; description: string }> = [
    {
      id: "cashOnDelivery",
      title: t("orderConfirmation.paymentCash"),
      description: t("orderConfirmation.paymentCashDescription"),
    },
    {
      id: "cardOnDelivery",
      title: t("orderConfirmation.paymentCard"),
      description: t("orderConfirmation.paymentCardDescription"),
    },
  ];

  const selectedDelivery = deliveryOptions.find((option) => option.id === deliveryMethod) || deliveryOptions[0];
  const deliveryFee = selectedDelivery.price;
  const finalTotal = totalAmount + deliveryFee;

  const fieldClassName = "w-full rounded-lg border border-white/10 bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)] outline-none transition-colors focus:border-[var(--accent)] disabled:opacity-50";

  useEffect(() => {
    if (isOpen) {
      const fullName = [userInfo?.firstName, userInfo?.lastName].filter(Boolean).join(" ").trim();
      setStep("details");
      setError(null);
      setCustomerName(fullName || userInfo?.name || "");
      setCustomerEmail(userInfo?.email || "");
      setCustomerPhone(userInfo?.phoneNumber || "");
      setShippingAddress("");
      setDeliveryMethod("standard");
      setPaymentMethod("cashOnDelivery");
      setNotes("");
      setCreatedOrderId(null);
    }
  }, [isOpen, userInfo]);

  const getBookById = (bookId: string) => {
    return books.find((book) => book.id === bookId);
  };

  const validateForm = () => {
    if (!customerName.trim()) return t("orderConfirmation.customerNameRequired");
    if (!customerEmail.trim()) return t("orderConfirmation.customerEmailRequired");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) return t("orderConfirmation.customerEmailInvalid");
    if (!shippingAddress.trim()) return t("orderConfirmation.shippingAddressRequired");
    return null;
  };

  const goToOptions = (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setStep("options");
  };

  const handleConfirmOrder = async () => {

    if (!token) {
      setError(t("orderConfirmation.loginRequired"));
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setStep("processing");

      const tokenValid = await checkAndRefreshToken();
      if (!tokenValid) {
        setError(t("orderConfirmation.sessionExpired"));
        setStep("review");
        return;
      }

      const orderData = {
        items: state.items.map((item) => ({
          bookId: item.bookId,
          quantity: item.quantity
        })),
        totalAmount: finalTotal,
        deliveryFee,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || null,
        shippingAddress: shippingAddress.trim(),
        deliveryMethod,
        paymentMethod,
        notes: notes.trim() || null
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        setCreatedOrderId(result.order?.id || null);
        await clear();
        setStep("success");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || t("orderConfirmation.orderErrorDetails"));
        setStep("review");
      }
    } catch {
      setError(t("orderConfirmation.orderError"));
      setStep("review");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 modal-enter">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/10 bg-[var(--card)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-[var(--foreground)]">
            {t("orderConfirmation.title")}
          </h3>
          {(step === "details" || step === "options" || step === "review") && (
            <button
              onClick={onClose}
              className="rounded-md p-1 text-[var(--muted)] transition-colors hover:bg-white/5 hover:text-[var(--foreground)]"
              aria-label={t("common.close")}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {(step === "details" || step === "options" || step === "review") && (
          <div className="mb-6 grid grid-cols-3 gap-2 text-xs font-medium">
            {["details", "options", "review"].map((item, index) => (
              <div
                key={item}
                className={`rounded-md border px-3 py-2 text-center ${
                  step === item
                    ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
                    : "border-white/10 bg-[var(--background)] text-[var(--muted)]"
                }`}
              >
                {index + 1}. {t(`orderConfirmation.step${index + 1}`)}
              </div>
            ))}
          </div>
        )}

        {step === "details" && (
          <form onSubmit={goToOptions} className="space-y-6">
            <section className="rounded-lg bg-[var(--background)] p-4">
              <h4 className="mb-3 font-medium text-[var(--foreground)]">{t("orderConfirmation.customerDetails")}</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-[var(--muted)]">{t("orderConfirmation.customerName")} *</span>
                  <input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    className={fieldClassName}
                    placeholder={t("orderConfirmation.customerNamePlaceholder")}
                    disabled={loading}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-[var(--muted)]">{t("orderConfirmation.customerEmail")} *</span>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                    className={fieldClassName}
                    placeholder={t("orderConfirmation.customerEmailPlaceholder")}
                    disabled={loading}
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block text-[var(--muted)]">{t("orderConfirmation.customerPhone")}</span>
                  <input
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    className={fieldClassName}
                    placeholder={t("orderConfirmation.customerPhonePlaceholder")}
                    disabled={loading}
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block text-[var(--muted)]">{t("orderConfirmation.shippingAddress")} *</span>
                  <textarea
                    value={shippingAddress}
                    onChange={(event) => setShippingAddress(event.target.value)}
                    className={fieldClassName}
                    rows={3}
                    placeholder={t("orderConfirmation.shippingAddressPlaceholder")}
                    disabled={loading}
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block text-[var(--muted)]">{t("orderConfirmation.notes")}</span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className={fieldClassName}
                    rows={2}
                    placeholder={t("orderConfirmation.notesPlaceholder")}
                    disabled={loading}
                  />
                </label>
              </div>
            </section>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-white/20 bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-white/5"
              >
                {t("orderConfirmation.cancel")}
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg border border-transparent bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[var(--accent)]/80"
              >
                {t("orderConfirmation.next")}
              </button>
            </div>
          </form>
        )}

        {step === "options" && (
          <div className="space-y-6">
            <section className="rounded-lg bg-[var(--background)] p-4">
              <h4 className="mb-3 font-medium text-[var(--foreground)]">{t("orderConfirmation.deliveryMethod")}</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {deliveryOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDeliveryMethod(option.id)}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      deliveryMethod === option.id
                        ? "border-[var(--accent)] bg-[var(--accent)]/15"
                        : "border-white/10 bg-[var(--card)] hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-[var(--foreground)]">{option.title}</div>
                        <div className="mt-1 text-sm text-[var(--muted)]">{option.description}</div>
                      </div>
                      <div className="text-sm font-semibold text-[var(--accent)]">
                        {option.price === 0 ? t("orderConfirmation.free") : `€${option.price.toFixed(2)}`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-lg bg-[var(--background)] p-4">
              <h4 className="mb-3 font-medium text-[var(--foreground)]">{t("orderConfirmation.paymentMethod")}</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {paymentOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPaymentMethod(option.id)}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      paymentMethod === option.id
                        ? "border-[var(--accent)] bg-[var(--accent)]/15"
                        : "border-white/10 bg-[var(--card)] hover:bg-white/5"
                    }`}
                  >
                    <div className="font-medium text-[var(--foreground)]">{option.title}</div>
                    <div className="mt-1 text-sm text-[var(--muted)]">{option.description}</div>
                  </button>
                ))}
              </div>
            </section>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("details")}
                className="flex-1 rounded-lg border border-white/20 bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-white/5"
              >
                {t("orderConfirmation.back")}
              </button>
              <button
                type="button"
                onClick={() => setStep("review")}
                className="flex-1 rounded-lg border border-transparent bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[var(--accent)]/80"
              >
                {t("orderConfirmation.next")}
              </button>
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-6">
            <section className="rounded-lg bg-[var(--background)] p-4">
              <h4 className="mb-3 font-medium text-[var(--foreground)]">{t("orderConfirmation.orderDetails")}</h4>
              <div className="mb-4 max-h-56 space-y-3 overflow-y-auto pr-1">
                {state.items.map((item) => {
                  const book = getBookById(item.bookId);
                  if (!book) return null;
                  const localizedBook = localizeBook(book, language);
                  const lineTotal = book.price * item.quantity;

                  return (
                    <div key={item.bookId} className="flex gap-3 rounded-md border border-white/10 p-3">
                      <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-white/5">
                        {book.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={book.imageUrl} alt={localizedBook.displayTitle} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[var(--muted)]">
                            {localizedBook.displayTitle.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-[var(--foreground)]">{localizedBook.displayTitle}</div>
                        <div className="text-xs text-[var(--muted)]">{localizedBook.displayAuthor}</div>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-[var(--muted)]">{item.quantity} x €{book.price.toFixed(2)}</span>
                          <span className="font-medium text-[var(--foreground)]">€{lineTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-2 border-t border-white/10 pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">{t("orderConfirmation.amount")}:</span>
                  <span className="text-[var(--foreground)]">€{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">{t("orderConfirmation.items")}:</span>
                  <span className="text-[var(--foreground)]">{totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">{t("orderConfirmation.shipping")}:</span>
                  <span className={deliveryFee === 0 ? "text-green-400" : "text-[var(--foreground)]"}>
                    {deliveryFee === 0 ? t("orderConfirmation.free") : `€${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">{t("orderConfirmation.deliveryMethod")}:</span>
                  <span className="text-[var(--foreground)]">{selectedDelivery.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">{t("orderConfirmation.paymentMethod")}:</span>
                  <span className="text-[var(--foreground)]">
                    {paymentOptions.find((option) => option.id === paymentMethod)?.title}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-[var(--foreground)]">{t("orderConfirmation.total")}:</span>
                  <span className="text-[var(--accent)]">€{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </section>

            <section className="rounded-lg bg-[var(--background)] p-4">
              <h4 className="mb-3 font-medium text-[var(--foreground)]">{t("orderConfirmation.customerDetails")}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[var(--muted)]">{t("orderConfirmation.customerName")}:</span>
                  <span className="text-right text-[var(--foreground)]">{customerName}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[var(--muted)]">{t("orderConfirmation.customerEmail")}:</span>
                  <span className="text-right text-[var(--foreground)]">{customerEmail}</span>
                </div>
                {customerPhone && (
                  <div className="flex justify-between gap-4">
                    <span className="text-[var(--muted)]">{t("orderConfirmation.customerPhone")}:</span>
                    <span className="text-right text-[var(--foreground)]">{customerPhone}</span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-[var(--muted)]">{t("orderConfirmation.shippingAddress")}:</span>
                  <span className="text-right text-[var(--foreground)]">{shippingAddress}</span>
                </div>
              </div>
            </section>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("options")}
                className="flex-1 rounded-lg border border-white/20 bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-white/5"
              >
                {t("orderConfirmation.back")}
              </button>
              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={loading}
                className="flex-1 rounded-lg border border-transparent bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[var(--accent)]/80 disabled:opacity-50"
              >
                {loading ? t("orderConfirmation.processing") : t("orderConfirmation.confirm")}
              </button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)]/20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent"></div>
            </div>
            <div>
              <h4 className="mb-2 text-lg font-medium text-[var(--foreground)]">
                {t("orderConfirmation.processingTitle")}
              </h4>
              <p className="text-sm text-[var(--muted)]">
                {t("orderConfirmation.processingDescription")}
              </p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-6 text-center">
            <div className="success-animation relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="absolute inset-0 mx-auto h-16 w-16 animate-ping rounded-full bg-green-500/30"></div>
            </div>
            <div>
              <h4 className="mb-2 text-lg font-medium text-[var(--foreground)]">
                {t("orderConfirmation.successTitle")}
              </h4>
              <p className="mb-4 text-sm text-[var(--muted)]">
                {t("orderConfirmation.successDescription", { amount: finalTotal.toFixed(2) })}
              </p>
              {createdOrderId && (
                <p className="mb-4 text-sm font-medium text-[var(--foreground)]">
                  {t("orderConfirmation.orderNumber")}: #{createdOrderId.slice(-8)}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[var(--accent)]/80"
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
