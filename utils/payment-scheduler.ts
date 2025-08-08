interface PaymentSchedule {
  amtMonth: number;
  firstPay: Date;
  secondPay: Date;
  thirdPay: Date;
}

export function getUpcomingPayment(paymentSchedule: PaymentSchedule) {
  const paymentDates = [
    paymentSchedule.firstPay,
    paymentSchedule.secondPay,
    paymentSchedule.thirdPay
  ]
    .map((date) => new Date(date))
    .filter((date) => !isNaN(date.getTime()));

  // Get the last payment date
  const lastPaymentDate = new Date(
    Math.max(...paymentDates.map((d) => d.getTime()))
  );

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  lastPaymentDate.setHours(0, 0, 0, 0);

  // Calculate the date 15 days before the last payment
  const reminderDate = new Date(lastPaymentDate);
  reminderDate.setDate(lastPaymentDate.getDate() - 15);

  return {
    paymentAmount: paymentSchedule.amtMonth,
    paymentDate: lastPaymentDate,
    reminderDate: reminderDate,
    isReminderDue: currentDate >= reminderDate && currentDate <= lastPaymentDate
  };
}
