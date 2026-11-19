import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  useGetPurchaseOrderQuery,
  useListPurchaseOrdersQuery,
} from '@/features/purchase-orders/purchase-orders.api';
import {
  shipmentFormSchema,
  type ShipmentFormValues,
} from '@/features/shipments/shipments.schema';
import {
  useCreateShipmentMutation,
  useGetShipmentQuery,
  useUpdateShipmentMutation,
} from '@/features/shipments/shipments.api';
import { FormActions } from '@/shared/components/form-actions';
import { FieldGrid, SelectField, TextField, TextareaField } from '@/shared/components/form-fields';
import { PageHeader } from '@/shared/components/page-header';
import { SplashScreen } from '@/shared/components/splash-screen';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { applyServerFieldErrors, toastApiError, toastError } from '@/shared/utils/toast';

const emptyValues: ShipmentFormValues = {
  purchaseOrderId: '',
  carrier: '',
  trackingNumber: '',
  shippingMethod: '',
  origin: '',
  destination: '',
  estimatedDeliveryDate: '',
  notes: '',
};

export const ShipmentFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPurchaseOrderId = searchParams.get('purchaseOrderId') ?? '';

  const { data: shipment, isLoading } = useGetShipmentQuery(id ?? '', { skip: !isEdit });
  const { data: approvedOrders } = useListPurchaseOrdersQuery(
    { limit: 100, status: 'APPROVED' },
    { skip: isEdit },
  );
  const { data: productionOrders } = useListPurchaseOrdersQuery(
    { limit: 100, status: 'IN_PRODUCTION' },
    { skip: isEdit },
  );
  const [createShipment, { isLoading: creating }] = useCreateShipmentMutation();
  const [updateShipment, { isLoading: updating }] = useUpdateShipmentMutation();
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const initializedPoRef = useRef<string | null>(null);

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: { ...emptyValues, purchaseOrderId: initialPurchaseOrderId },
  });
  const { reset, handleSubmit, setError, watch, formState } = form;
  const purchaseOrderId = watch('purchaseOrderId') ?? '';
  const { data: purchaseOrder } = useGetPurchaseOrderQuery(purchaseOrderId, {
    skip: !purchaseOrderId || isEdit,
  });

  useEffect(() => {
    if (!shipment) return;
    reset({
      purchaseOrderId: '',
      carrier: shipment.carrier ?? '',
      trackingNumber: shipment.trackingNumber ?? '',
      shippingMethod: shipment.shippingMethod ?? '',
      origin: shipment.origin ?? '',
      destination: shipment.destination ?? '',
      estimatedDeliveryDate: shipment.estimatedDeliveryDate?.slice(0, 10) ?? '',
      notes: shipment.notes ?? '',
    });
  }, [shipment, reset]);

  useEffect(() => {
    if (!purchaseOrder) return;
    if (initializedPoRef.current === purchaseOrder.id) return;

    initializedPoRef.current = purchaseOrder.id;
    const next: Record<string, string> = {};
    for (const item of purchaseOrder.items ?? []) {
      next[item.id] = String(item.quantity);
    }
    setQuantities(next);
  }, [purchaseOrder]);

  const orderOptions = useMemo(() => {
    const combined = [...(approvedOrders?.items ?? []), ...(productionOrders?.items ?? [])];
    const seen = new Set<string>();

    return combined
      .filter((order) => {
        if (seen.has(order.id)) return false;
        seen.add(order.id);
        return true;
      })
      .map((order) => ({
        value: order.id,
        label: `${order.orderNumber} — ${order.customer?.name ?? 'Customer'}`,
      }));
  }, [approvedOrders, productionOrders]);

  const updateQuantity = (itemId: string, value: string) => {
    setQuantities((current) => ({ ...current, [itemId]: value }));
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!isEdit && !values.purchaseOrderId) {
      setError('purchaseOrderId', { type: 'manual', message: 'Select a purchase order' });
      return;
    }

    const orderItems = purchaseOrder?.items ?? [];
    const items = orderItems
      .map((item) => ({
        purchaseOrderItemId: item.id,
        quantity: Number(quantities[item.id] ?? 0),
        ordered: item.quantity,
      }))
      .filter((item) => item.quantity > 0);

    if (!isEdit) {
      if (items.length === 0) {
        toastError('Enter a shipment quantity for at least one line.');
        return;
      }

      if (
        items.some(
          (item) => !Number.isInteger(item.quantity) || item.quantity > item.ordered,
        )
      ) {
        toastError('Shipment quantities must be whole numbers up to the ordered quantity.');
        return;
      }
    }

    try {
      const body = {
        carrier: values.carrier ?? '',
        trackingNumber: values.trackingNumber ?? '',
        shippingMethod: values.shippingMethod ?? '',
        origin: values.origin ?? '',
        destination: values.destination ?? '',
        estimatedDeliveryDate: values.estimatedDeliveryDate || undefined,
        notes: values.notes ?? '',
      };

      const saved = isEdit
        ? await updateShipment({ id: id ?? '', body }).unwrap()
        : await createShipment({
            ...body,
            items: items.map(({ purchaseOrderItemId, quantity }) => ({
              purchaseOrderItemId,
              quantity,
            })),
          }).unwrap();
      navigate(`/shipments/${saved.id}`);
    } catch (error) {
      if (applyServerFieldErrors(error, setError)) return;
      toastApiError(error);
    }
  });

  if (isEdit && isLoading) return <SplashScreen label="Loading shipment…" />;

  const isSubmitting = creating || updating || formState.isSubmitting;

  return (
    <div className="space-y-5">
      <PageHeader
        backTo={isEdit ? `/shipments/${id}` : '/shipments'}
        backLabel={isEdit ? 'Back to shipment' : 'All shipments'}
        eyebrow={isEdit ? 'Edit freight' : 'New freight'}
        title={isEdit ? 'Edit shipment' : 'New shipment'}
        description="Only approved or in-production purchase orders can be shipped."
      />

      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Freight details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEdit ? (
                shipment?.items?.[0] ? (
                  <p className="text-sm text-muted-foreground">
                    Items from purchase order{' '}
                    <Link
                      to={`/purchase-orders/${shipment.items[0].purchaseOrderItem.purchaseOrderId}`}
                      className="font-mono text-xs text-foreground underline decoration-border underline-offset-4"
                    >
                      {shipment.items[0].purchaseOrderItem.purchaseOrder.orderNumber}
                    </Link>
                  </p>
                ) : null
              ) : (
                <FieldGrid>
                  <SelectField
                    name="purchaseOrderId"
                    label="Purchase order"
                    placeholder="Select an approved or in-production order"
                    options={orderOptions}
                    required
                    className="sm:col-span-2"
                  />
                </FieldGrid>
              )}

              <FieldGrid>
                <TextField name="carrier" label="Carrier" placeholder="DHL, Maersk…" />
                <TextField name="trackingNumber" label="Tracking number" placeholder="Optional" />
                <TextField name="shippingMethod" label="Method" placeholder="Air, sea, courier…" />
                <TextField
                  name="estimatedDeliveryDate"
                  label="Estimated delivery"
                  type="date"
                />
                <TextField name="origin" label="Origin" placeholder="Guangzhou" />
                <TextField name="destination" label="Destination" placeholder="Chattogram" />
              </FieldGrid>

              <TextareaField
                name="notes"
                label="Notes"
                placeholder="Packing list references, handling instructions…"
                rows={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {isEdit ? 'Shipped items' : 'Items to ship'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEdit ? (
                (shipment?.items ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items on this shipment.</p>
                ) : (
                  <div className="space-y-2">
                    {(shipment?.items ?? []).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{item.purchaseOrderItem.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.purchaseOrderItem.purchaseOrder.orderNumber} · ordered{' '}
                            {item.purchaseOrderItem.quantity}
                          </p>
                        </div>
                        <span className="font-mono text-xs">{item.quantity} shipped</span>
                      </div>
                    ))}
                  </div>
                )
              ) : !purchaseOrder ? (
                <p className="text-sm text-muted-foreground">
                  Select a purchase order to load its lines.
                </p>
              ) : purchaseOrder.items?.length ? (
                <div className="space-y-2">
                  <div className="hidden grid-cols-[1fr_7rem_8rem] gap-3 px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:grid">
                    <span>Item</span>
                    <span className="text-right">Ordered</span>
                    <span className="text-right">Shipping</span>
                  </div>
                  {purchaseOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-2 rounded-md border border-border px-3 py-2.5 sm:grid-cols-[1fr_7rem_8rem] sm:items-center sm:gap-3 sm:border-0 sm:px-1 sm:py-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.description || 'No description'}
                        </p>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground sm:text-right">
                        {item.quantity}
                      </p>
                      <Input
                        type="number"
                        min={0}
                        max={item.quantity}
                        step={1}
                        value={quantities[item.id] ?? ''}
                        onChange={(event) => updateQuantity(item.id, event.target.value)}
                        aria-label={`Shipment quantity for ${item.name}`}
                        className="h-9 text-right font-mono text-xs"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">This order has no line items.</p>
              )}
            </CardContent>
          </Card>

          <FormActions
            cancelTo={isEdit ? `/shipments/${id}` : '/shipments'}
            submitLabel={isEdit ? 'Save changes' : 'Create shipment'}
            isSubmitting={isSubmitting}
          />
        </form>
      </FormProvider>
    </div>
  );
};
