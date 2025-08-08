'use client';

import { useEffect, useState, useRef, useId } from 'react';
import { getToCollect } from '@/actions/tocollect-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUpcomingPayment } from '@/utils/payment-scheduler';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CardTitle } from '@/components/ui/card';
import { CardHeader, Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useOutsideClick } from '@/hooks/use-outside-click';

type Payment = {
  name: string;
  amtMonth: number;
  firstPay: Date | null;
  secondPay: Date | null;
  thirdPay: Date | null;
  firstStatus: boolean | null;
  secondStatus: boolean | null;
  thirdStatus: boolean | null;
};

const getLatestPayment = (payment: Payment) => {
  // 1. Create array of payment dates and process them
  const paymentDates = [payment.firstPay, payment.secondPay, payment.thirdPay]
    // 2. Filter out null values and type assert remaining values as Date
    .filter((date): date is Date => date !== null)
    // 3. Convert each date string to Date object
    .map((date) => new Date(date));
  // 4. Return the latest date or null if no dates exist
  return paymentDates.length > 0 ? paymentDates[paymentDates.length - 1] : null;
};

const calculateTotals = (payments: Payment[]) => {
  return payments.reduce((sum, payment) => {
    //* Check if the payment dates are valid (not null or undefined)
    const firstPayValid = payment.firstPay != null;
    const secondPayValid = payment.secondPay != null;
    const thirdPayValid = payment.thirdPay != null;

    //* If all payment dates are null, skip this payment
    if (!firstPayValid && !secondPayValid && !thirdPayValid) {
      return sum; // Skip this payment if all dates are null
    }
    // 1st validate
    //* Logic for calculating totals based on statuses and valid dates
    if (
      payment.firstStatus === false &&
      firstPayValid && //Pending with Valid Date
      payment.secondStatus === false &&
      payment.thirdStatus === false &&
      !secondPayValid && //Pending with Null Date
      !thirdPayValid //Pending with Null Date
      // 1 Month to Pay before the Due Date
    ) {
      sum += Number(payment.amtMonth) * 1; // Multiply by 1 if all statuses are false and firstpay is valid
    } else if (
      payment.firstStatus === false &&
      firstPayValid && //Pending with Valid Date
      payment.secondStatus === false &&
      secondPayValid && //Pending with Valid Date
      payment.thirdStatus === false &&
      !thirdPayValid //Pending with Null Date
      // 2 Months to Pay before the Due Date
    ) {
      sum += Number(payment.amtMonth) * 2; // Multiply by 2 if firstpay is valid and secondpay is valid and thirdpay is null
    } else if (
      payment.firstStatus === false &&
      firstPayValid && //Pending with Valid Date
      payment.secondStatus === false &&
      secondPayValid && //Pending with Valid Date
      payment.thirdStatus === false &&
      thirdPayValid //Pending with Valid Date
      // 3 Months to Pay before the Due Date
    ) {
      sum += Number(payment.amtMonth) * 3; // Multiply by 3 if firstpay is valid and secondpay is valid and thirdpay is valid
      // 1st validate

      // 2nd validate
    } else if (
      payment.firstStatus === true &&
      firstPayValid && //Paid with Valid Date
      payment.secondStatus === false &&
      secondPayValid && //Pending with Valid Date
      payment.thirdStatus === false &&
      !thirdPayValid //Pengind with Null Date
    ) {
      sum += Number(payment.amtMonth); // Multiply by 1 if firststatus is paid and firstpay is valid and secondpay is valid and thirdpay is null
    } else if (
      payment.firstStatus === true &&
      firstPayValid && //Paid with Valid Date
      payment.secondStatus === false &&
      secondPayValid && //Pending with Valid Date
      payment.thirdStatus === false &&
      thirdPayValid //Pending with Valid Date
    ) {
      sum += Number(payment.amtMonth) * 2; // Multiply by 2 if firststatus is paid and firstpay is valid and secondstatus is paid secondpay is valid and thirdpay is valide and paid
    } else if (
      payment.firstStatus === true &&
      firstPayValid && //Paid with Valid Date
      payment.secondStatus === true &&
      secondPayValid && //Paid with Valid Date
      payment.thirdStatus === false &&
      thirdPayValid //Pending with Valid Date
    ) {
      sum += Number(payment.amtMonth) * 1; // Multiply by 1 if firststatus is paid and firstpay is valid and secondpay is valid and thirdpay is null
    } else if (
      payment.firstStatus === true &&
      firstPayValid && //Paid with Valid Date
      payment.secondStatus === true &&
      secondPayValid && //Paid with Valid Date
      payment.thirdStatus === false &&
      !thirdPayValid //Pending with Null Date
    ) {
      sum += Number(payment.amtMonth) * 1; // Multiply by 1 if firststatus is paid and firstpay is valid and secondpay is valid and thirdpay is null
    }

    return sum; // Return the current sum
  }, 0);
};

const formatCurrency = (amount: number) => {
  return `₱ ${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export function ToCollect() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().getMonth().toString()
  );
  const [active, setActive] = useState<Payment | null>(null);
  const ref = useRef<HTMLDivElement>(null!);
  const id = useId();

  useEffect(() => {
    async function fetchData() {
      const data = await getToCollect();
      const formattedData = data.map((payment) => ({
        ...payment,
        firstPay: payment.firstPay ? new Date(payment.firstPay) : null,
        secondPay: payment.secondPay ? new Date(payment.secondPay) : null,
        thirdPay: payment.thirdPay ? new Date(payment.thirdPay) : null
      }));
      setPayments(formattedData);
    }
    fetchData();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActive(null);
      }
    }

    if (active) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px'; // Compensate for scrollbar disappearance
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  if (!Array.isArray(payments) || payments.length === 0) {
    return (
      <Card className="h-[594px]">
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
        </CardHeader>
        <div className="mt-16 flex items-center justify-center">
          <CardContent className="flex justify-center">
            <div className="items-center space-y-3">
              <Skeleton className=" h-[200px] w-[350px] rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-[300px]" />
                <Skeleton className="h-6 w-[250px]" />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }
  const upcomingPayment =
    payments.length > 0 && payments[0].firstPay
      ? getUpcomingPayment({
          ...payments[0],
          amtMonth: Number(payments[0].amtMonth),
          firstPay: payments[0].firstPay
            ? new Date(payments[0].firstPay)
            : new Date(), // Default to current date if null
          secondPay: payments[0].secondPay
            ? new Date(payments[0].secondPay)
            : new Date(), // Default to current date if null
          thirdPay: payments[0].thirdPay
            ? new Date(payments[0].thirdPay)
            : new Date() // Default to current date if null
        })
      : null;

  const filteredPayments = payments
    .filter((payment) => {
      // Check each payment date individually
      const hasCurrentPayment =
        (payment.firstPay &&
          new Date(payment.firstPay).getMonth().toString() === selectedMonth) ||
        (payment.secondPay &&
          new Date(payment.secondPay).getMonth().toString() ===
            selectedMonth) ||
        (payment.thirdPay &&
          new Date(payment.thirdPay).getMonth().toString() === selectedMonth);

      return !selectedMonth || hasCurrentPayment;
    })
    .sort((a, b) => {
      // First sort by name alphabetically
      const nameComparison = a.name.localeCompare(b.name);
      if (nameComparison !== 0) return nameComparison;

      // Then sort by the latest payment date
      const dateA = getLatestPayment(a);
      const dateB = getLatestPayment(b);
      if (!dateA || !dateB) return 0;
      return dateB.getTime() - dateA.getTime();
    });

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 h-full w-full bg-neutral-800/80"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 z-[100] grid place-items-center">
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <motion.button
                  key={`button-${active.name}-${id}`}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.05 }
                  }}
                  className="absolute right-2 top-2 flex h-12 w-12 items-center justify-center rounded-full"
                  onClick={() => setActive(null)}
                >
                  <CloseIcon />
                </motion.button>
                <motion.div
                  layoutId={`card-${active.name}-${id}`}
                  ref={ref}
                  className="relative w-full max-w-[500px] overflow-y-auto rounded-2xl bg-white p-4 dark:bg-neutral-900"
                  style={{ maxHeight: 'calc(100vh - 2rem)' }}
                >
                  <div className="justify-first flex">
                    <Avatar className="h-[100px] w-[100px] rounded-2xl">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>
                        {active.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <motion.h3
                    layoutId={`title-${active.name}-${id}`}
                    className="mb-4 mt-4 text-xl font-bold"
                  >
                    {active.name}
                  </motion.h3>
                  <div className="space-y-4">
                    {active.firstPay && (
                      <div className="flex items-center justify-between">
                        <span>First Payment:</span>
                        <span
                          className={
                            active.firstStatus
                              ? 'text-[#10b981]'
                              : new Date(active.firstPay).getMonth() ===
                                new Date().getMonth()
                              ? 'text-[#f97316]'
                              : 'text-muted-foreground'
                          }
                        >
                          {new Date(active.firstPay).toLocaleDateString(
                            'en-PH',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }
                          )}
                        </span>
                      </div>
                    )}
                    {active.secondPay && (
                      <div className="flex items-center justify-between">
                        <span>Second Payment:</span>
                        <span
                          className={
                            active.secondStatus
                              ? 'text-[#10b981]'
                              : new Date(active.secondPay).getMonth() ===
                                new Date().getMonth()
                              ? 'text-[#f97316]'
                              : 'text-muted-foreground'
                          }
                        >
                          {new Date(active.secondPay).toLocaleDateString(
                            'en-PH',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }
                          )}
                        </span>
                      </div>
                    )}
                    {active.thirdPay && (
                      <div className="flex items-center justify-between">
                        <span>Third Payment:</span>
                        <span
                          className={
                            active.thirdStatus
                              ? 'text-[#10b981]'
                              : new Date(active.thirdPay).getMonth() ===
                                new Date().getMonth()
                              ? 'text-[#f97316]'
                              : 'text-muted-foreground'
                          }
                        >
                          {new Date(active.thirdPay).toLocaleDateString(
                            'en-PH',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between font-bold">
                      <span>Monthly Amount:</span>
                      <span>{formatCurrency(active.amtMonth)}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
          {/* <CardDescription>Monthly Payment Summary</CardDescription> */}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {upcomingPayment && (
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1 text-left">
                    <p className="text-sm text-muted-foreground">
                      Total Amount
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        calculateTotals(
                          selectedMonth
                            ? payments.filter(
                                (payment) =>
                                  (payment.firstPay &&
                                    new Date(payment.firstPay)
                                      .getMonth()
                                      .toString() === selectedMonth) ||
                                  (payment.secondPay &&
                                    new Date(payment.secondPay)
                                      .getMonth()
                                      .toString() === selectedMonth) ||
                                  (payment.thirdPay &&
                                    new Date(payment.thirdPay)
                                      .getMonth()
                                      .toString() === selectedMonth)
                              )
                            : payments
                        )
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedMonth}
                      onValueChange={setSelectedMonth}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Filter by month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Months</SelectItem>
                        {[
                          'January',
                          'February',
                          'March',
                          'April',
                          'May',
                          'June',
                          'July',
                          'August',
                          'September',
                          'October',
                          'November',
                          'December'
                        ].map((month, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            <ScrollArea className="h-[594px] w-[full] rounded-md border p-3">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment, index) => (
                  <motion.div
                    layoutId={`card-${payment.name}-${id}`}
                    key={index}
                    onClick={() => setActive(payment)}
                    className="mb-2 flex cursor-pointer items-center space-y-2 rounded-md border-b p-2 pb-2 hover:bg-gray-50 dark:hover:bg-neutral-800"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>
                        {payment.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {payment.name}
                      </p>
                      {payment.firstPay && (
                        <p
                          className={`text-sm ${
                            payment.firstStatus
                              ? 'text-[#10b981]'
                              : new Date(payment.firstPay).getMonth() ===
                                new Date().getMonth()
                              ? 'text-[#f97316]'
                              : 'text-muted-foreground'
                          }`}
                        >
                          First Payment Due:{' '}
                          {new Date(payment.firstPay).toLocaleDateString(
                            'en-PH',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }
                          )}
                        </p>
                      )}

                      {payment.secondPay && (
                        <p
                          className={`text-sm ${
                            payment.secondStatus
                              ? 'text-[#10b981]'
                              : new Date(payment.secondPay).getMonth() ===
                                new Date().getMonth()
                              ? 'text-[#f97316]'
                              : 'text-muted-foreground'
                          }`}
                        >
                          Second Payment Due:{' '}
                          {new Date(payment.secondPay).toLocaleDateString(
                            'en-PH',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }
                          )}
                        </p>
                      )}

                      {payment.thirdPay && (
                        <p
                          className={`text-sm ${
                            payment.thirdStatus
                              ? 'text-[#10b981]'
                              : new Date(payment.thirdPay).getMonth() ===
                                new Date().getMonth()
                              ? 'text-[#f97316]'
                              : 'text-muted-foreground'
                          }`}
                        >
                          Third Payment Due:{' '}
                          {new Date(payment.thirdPay).toLocaleDateString(
                            'en-PH',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }
                          )}
                        </p>
                      )}
                    </div>

                    <div className="ml-auto font-medium">
                      ₱
                      {Number(payment.amtMonth).toLocaleString('en-PH', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  No Data Available For The Selected Month!
                </div>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
const CloseIcon = () => {
  return <X className="h-4 w-4 text-white" />;
};
