// 'use client';

// import { useCallback, useEffect, useState } from 'react';
// import { MonthLoan } from './monthloan';
// import { TotalLoans } from './total-loans';
// import PageContainer from '@/components/layout/page-container';
// import { Button } from '@/components/ui/button';
// import {
//   HandCoins,
//   Landmark,
//   PiggyBank,
//   Wallet,
//   Edit,
//   Triangle,
//   CheckCheckIcon,
//   CircleDot,
//   OctagonAlertIcon,
//   DollarSignIcon,
//   TrendingDown,
//   TrendingUp
// } from 'lucide-react';
// import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger
// } from '@/components/ui/dialog';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   getdashboardTableData,
//   getTotalSavings,
//   getTotalInterest,
//   getTotalBank,
//   saveDashboardData,
//   insertDashboardData,
//   getCapital,
//   getLastMonthSavings,
//   getLastMonthCOB,
//   getLastMonthTotIntEarned,
//   getLastMonthSavIntEarned
// } from '@/actions/overview-actions';
// import {
//   getTotalInterestReceived,
//   getTotalPaidPenalty,
//   getTotalPendingInterest,
//   getTotalReceivables,
//   getTotalServCharge
// } from '@/actions/computation-actions';
// import { useSession } from 'next-auth/react';
// import { ToCollect } from './tocollect';
// import BarChart from './bargraph';
// import { AmountBalances } from './amount-balances';
// import { TopLoaner } from './toploaner';
// import { Input } from '@/components/ui/input';
// import { SiteFooter } from '@/components/layout/site-footer';
// import { Label } from '@/components/ui/label';
// import { toast } from '@/hooks/use-toast';
// import { CalendarDateRangePicker } from '@/components/ui/date-range-picker';
// import { Skeleton } from '@/components/ui/skeleton';
// import AnimatedBorderTrail from '@/components/animata/animated-border-trail';
// import { BackgroundGradient } from '@/components/aceternity/background-gradient';
// import { AuroraText } from '@/components/magicui/aurora-text';
// import { Badge } from '@/components/ui/badge';

// type DashboardData = {
//   id: string;
//   totsavings: number;
//   totonbank: number;
//   totintearned: number;
//   totsavintearned: number;
//   capital: number;
// };

// type TotalInterestReceivedData = {
//   totalInterestReceived: number;
// };

// type TotalPendingInterest = {
//   totalPendingInterest: number;
// };

// type TotalReceivables = {
//   totalReceivables: number;
// };

// type TotalPaidPenalty = {
//   totalpaidpenalty: number;
// };

// type TotalServCharge = {
//   totalservcharge: number;
// };

// export default function OverViewPage() {
//   const [data, setData] = useState<DashboardData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const { data: session } = useSession();
//   const [totalSavings, setTotalSavings] = useState<number>(0);
//   const [totalInterest, setTotalInterest] = useState<number>(0);
//   const [savingsAndInterest, setSavingsAndInterest] = useState<number>(0);
//   const [totalBank, setTotalBank] = useState<number>(0);
//   const [totonbank, setTotonbank] = useState(data?.totonbank ?? 0);
//   const [capital, setCapital] = useState<number>(0);
//   const [currentId, setCurrentId] = useState<number | null>(null);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [totalInterestReceived, setTotalInterestReceived] =
//     useState<TotalInterestReceivedData | null>(null);
//   const [totalPendingInterest, setPendingInterest] =
//     useState<TotalPendingInterest | null>(null);
//   const [totalReceivables, setTotalReceivables] =
//     useState<TotalReceivables | null>(null);
//   const [totalPaidPenalty, setTotalPaidPenalty] =
//     useState<TotalPaidPenalty | null>(null);
//   const [totalservcharge, setTotalServCharge] =
//     useState<TotalServCharge | null>(null);
//   const [lastMonthSavings, setLastMonthSavings] = useState<number>(0);
//   const [lastMonthBank, setLastMonthBank] = useState<number>(0);
//   const [lastMonthTotIntEarned, setLastMonthTotIntEarned] = useState<number>(0);
//   const [lastMonthSavIntEarned, setLastMonthSavIntEarned] = useState<number>(0);

//   const getPercentageChangeTotalSavings = () => {
//     // Check if totalSavings exists
//     if (totalSavings === 0) {
//       // console.log('No savings data available');
//       return 0;
//     }
//     // Get current month's data
//     const currentValue = totalSavings;
//     // console.log('Current value:', currentValue);
//     // Use the lastMonthSavings state instead of async call
//     const previousValue = lastMonthSavings;
//     // console.log('Previous value:', previousValue);
//     if (!previousValue) {
//       // console.log('No previous value available');
//       return 0;
//     }
//     const percentageChange =
//       ((currentValue - previousValue) / previousValue) * 100;
//     // Return rounded to 2 decimal places
//     return Math.round(percentageChange * 100) / 100;
//   };

//   const getPercentageChangeTotalBank = () => {
//     if (totalBank === 0) {
//       return 0;
//     }
//     const currentValue = totalBank;
//     const previousValue = lastMonthBank;
//     if (!previousValue) {
//       return 0;
//     }
//     const percentageChange =
//       ((currentValue - previousValue) / previousValue) * 100;
//     return Math.round(percentageChange * 100) / 100;
//   };

//   const getPercentageChangeTotalIntEarned = () => {
//     if (totalInterest === 0) {
//       return 0;
//     }
//     const currentValue = totalInterest;
//     const previousValue = lastMonthTotIntEarned;
//     if (!previousValue) {
//       return 0;
//     }
//     const percentageChange =
//       ((currentValue - previousValue) / previousValue) * 100;
//     return Math.round(percentageChange * 100) / 100;
//   };

//   const getPercentageChangeTotalSavIntEarned = () => {
//     if (savingsAndInterest === 0) {
//       return 0;
//     }
//     const currentValue = savingsAndInterest;
//     const previousValue = lastMonthSavIntEarned;
//     if (!previousValue) {
//       return 0;
//     }
//     const percentageChange =
//       ((currentValue - previousValue) / previousValue) * 100;
//     return Math.round(percentageChange * 100) / 100;
//   };

//   //* Define fetchData as a separate function
//   const fetchData = async () => {
//     try {
//       const result = await getdashboardTableData(); // Fetch the latest entries
//       if (result.length > 0) {
//         setData({
//           ...result[0],
//           totonbank: Number(result[0].totonbank), // Convert to number
//           capital: Number(result[0].capital) // Convert to number
//         }); // Set the latest entry
//         setCurrentId(result[0].id ? Number(result[0].id) + 1 : null); // Handle potential null or undefined
//       } else {
//         toast({
//           title: 'No Data Found',
//           description: 'There are no entries available at the moment.',
//           variant: 'destructive' // Change to 'default' or 'destructive' as needed
//         });
//         setCurrentId(1); // Start from 1 if no data exists
//       }
//     } catch (error) {
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Call fetchData in useEffect
//   useEffect(() => {
//     fetchData();
//   }, []);

//   useEffect(() => {
//     const fetchTotalSavings = async () => {
//       const totalsavings = await getTotalSavings();
//       setTotalSavings(Number(totalsavings));
//     };

//     const fetchTotalInterest = async () => {
//       const totalinterest = await getTotalInterest();
//       setTotalInterest(Number(totalinterest));
//     };

//     const fetchTotalBank = async () => {
//       const totalbank = await getTotalBank();
//       setTotalBank(Number(totalbank));
//     };

//     const fetchCapital = async () => {
//       const capital = await getCapital();
//       setCapital(Number(capital));
//     };

//     const fetchTotalInterestReceived = async () => {
//       const totalintreceived = await getTotalInterestReceived();
//       setTotalInterestReceived({
//         totalInterestReceived: Number(totalintreceived)
//       });
//     };

//     const fetchPendingInterest = async () => {
//       const totalpendingint = await getTotalPendingInterest();
//       setPendingInterest({ totalPendingInterest: Number(totalpendingint) });
//     };

//     const fetchTotalReceivables = async () => {
//       const totalreceivables = await getTotalReceivables();
//       setTotalReceivables({ totalReceivables: Number(totalreceivables) });
//     };

//     const fetchTotalPenaltyPaid = async () => {
//       const totalpaidpenalty = await getTotalPaidPenalty();
//       setTotalPaidPenalty({ totalpaidpenalty: Number(totalpaidpenalty) });
//     };

//     const fetchTotalServCharge = async () => {
//       const totalservcharge = await getTotalServCharge();
//       setTotalServCharge({ totalservcharge: Number(totalservcharge) });
//     };

//     fetchTotalSavings();
//     fetchTotalInterest();
//     fetchTotalBank();
//     fetchCapital();
//     fetchTotalInterestReceived();
//     fetchPendingInterest();
//     fetchTotalReceivables();
//     fetchTotalPenaltyPaid();
//     fetchTotalServCharge();
//   }, []);

//   useEffect(() => {
//     const sum = totalSavings + totalInterest;
//     setSavingsAndInterest(sum);
//   }, [totalSavings, totalInterest]);

//   //* Define saveDataToDatabase using useCallback
//   const saveDataToDatabase = useCallback(async () => {
//     // Check if any value is 0
//     if (
//       totalSavings === 0 ||
//       totalInterest === 0 ||
//       savingsAndInterest === 0 ||
//       totalBank === 0
//     ) {
//       return; //Exit the function without saving
//     }

//     try {
//       await saveDashboardData({
//         totalSavings,
//         totalInterest,
//         savingsAndInterest,
//         totalBank: totalBank.toString(), // Convert to string if needed
//         capital: capital.toString() // Convert to string if needed
//       });
//     } catch (error) {}
//   }, [totalSavings, totalInterest, totalBank, savingsAndInterest, capital]); // Include dependencies

//   useEffect(() => {
//     saveDataToDatabase();
//   }, [
//     totalSavings,
//     totalInterest,
//     totalBank,
//     savingsAndInterest,
//     saveDataToDatabase
//   ]);

//   const handleSave = async () => {
//     setLoading(true);
//     try {
//       if (data && data.id) {
//         // Ensure data is valid
//         const payload = {
//           id: currentId ?? data.id, // Use currentId or fallback to data.id
//           totalSavings: totalSavings,
//           totonbank: totonbank,
//           capital: capital,
//           totintearned: totalInterest,
//           totsavintearned: savingsAndInterest,
//           createdAt: new Date().toISOString(),
//           updatedAt: new Date().toISOString()
//         };

//         //* Call the server action directly
//         const result = await insertDashboardData(payload);

//         //* Fetch the latest data again to update the display
//         await fetchData(); // Re-fetch data to get the latest state
//         toast({
//           title: 'Current on Bank',
//           description: 'Amount saved successfully'
//         });
//         //* Close the dialog after saving
//         setIsDialogOpen(false); // Close the dialog
//       } else {
//         // console.error('Invalid current ID:', currentId);
//       }
//     } catch (error) {
//       // console.error('Error saving dashboard data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatNumber = (value: string) => {
//     const number = parseFloat(value);
//     return isNaN(number)
//       ? ''
//       : number.toLocaleString('en-PH', {
//           minimumFractionDigits: 0,
//           maximumFractionDigits: 0
//         });
//   };

//   useEffect(() => {
//     // Fetch last month's savings
//     getLastMonthSavings().then((value) => {
//       setLastMonthSavings(value);
//     });

//     getLastMonthCOB().then((value) => {
//       setLastMonthBank(Number(value));
//     });

//     getLastMonthTotIntEarned().then((value) => {
//       setLastMonthTotIntEarned(value);
//     });

//     getLastMonthSavIntEarned().then((value) => {
//       setLastMonthSavIntEarned(value);
//     });
//   }, []); // Run once on component mount

//   return (
//     <PageContainer scrollable>
//       <div className="space-y-2">
//         <div className="flex items-center justify-between space-y-2">
//           {/* <AnimatedGradientText className="text-3xl"> */}
//           <h2 className="text-2xl font-bold tracking-tight">
//             Hi, Welcome back 👋{' '}
//             <AuroraText className="text-2xl font-bold">
//               {session?.user?.name}
//             </AuroraText>
//           </h2>

//           {/* </AnimatedGradientText> */}
//           <div className="hidden items-center space-x-2 md:flex">
//             <CalendarDateRangePicker />
//             {/* <Button>Download</Button> */}
//           </div>
//         </div>
//         <Tabs defaultValue="overview" className="space-y-4">
//           <TabsList>
//             <TabsTrigger value="overview">Overview</TabsTrigger>
//             <TabsTrigger value="analytics">Analytics</TabsTrigger>
//           </TabsList>
//           <TabsContent value="overview" className="space-y-4">
//             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//               <BackgroundGradient className="h-full w-full rounded-md bg-white dark:bg-neutral-900">
//                 {/* <Card className="shadow-[rgba(0,0,0,0.2)_5px_5px_4px_0px]"> */}
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-xl font-thin text-muted-foreground">
//                     Total Savings
//                   </CardTitle>
//                   <PiggyBank size={24} color="#333333" strokeWidth={1.5} />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {loading ? (
//                       <Skeleton className="h-8 w-[200px] sm:w-[100px] md:w-[100px] lg:w-[240px]" />
//                     ) : (
//                       new Intl.NumberFormat('en-PH', {
//                         style: 'currency',
//                         currency: 'PHP'
//                       }).format(totalSavings)
//                     )}
//                   </div>
//                   <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
//                     <Badge
//                       variant="outline"
//                       className={
//                         getPercentageChangeTotalSavings() < 0
//                           ? 'border-[#ef4444]/0 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/10'
//                           : 'border-[#10b981]/0 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/10'
//                       }
//                     >
//                       {getPercentageChangeTotalSavings() < 0 ? (
//                         <TrendingDown className="mr-1 h-4 w-4" />
//                       ) : (
//                         <TrendingUp className="mr-1 h-4 w-4" />
//                       )}
//                       {getPercentageChangeTotalSavings()}%
//                     </Badge>
//                     From Last Month
//                   </div>
//                 </CardContent>
//                 {/* </Card> */}
//               </BackgroundGradient>
//               <BackgroundGradient className="h-full w-full rounded-md bg-white dark:bg-neutral-900">
//                 {/* <Card className="relative shadow-[rgba(0,0,0,0.2)_5px_5px_4px_0px]"> */}
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-xl font-thin text-muted-foreground">
//                     Current on Bank
//                   </CardTitle>
//                   <Landmark size={24} color="#333333" strokeWidth={1.5} />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {loading ? (
//                       <Skeleton className="h-8 w-[200px] sm:w-[100px] md:w-[100px] lg:w-[240px]" />
//                     ) : (
//                       new Intl.NumberFormat('en-PH', {
//                         style: 'currency',
//                         currency: 'PHP'
//                       }).format(Number(data?.totonbank ?? 0))
//                     )}
//                   </div>
//                   <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
//                     <Badge
//                       variant="outline"
//                       className={
//                         getPercentageChangeTotalBank() < 0
//                           ? 'border-[#ef4444]/0 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/10'
//                           : 'border-[#10b981]/0 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/10'
//                       }
//                     >
//                       {getPercentageChangeTotalBank() < 0 ? (
//                         <TrendingDown className="mr-1 h-4 w-4" />
//                       ) : (
//                         <TrendingUp className="mr-1 h-4 w-4" />
//                       )}
//                       {getPercentageChangeTotalBank()}%
//                     </Badge>
//                     From Last Month
//                   </div>
//                 </CardContent>
//                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                   <DialogTrigger className="absolute bottom-4 right-4 p-2">
//                     <Edit size={24} color="#333333" strokeWidth={1.5} />
//                   </DialogTrigger>
//                   <DialogContent className="sm:max-w-[425px]">
//                     <DialogHeader>
//                       <DialogTitle>Edit Current on Bank</DialogTitle>
//                       <DialogDescription>
//                         Make changes to the total amount on bank here. Click
//                         save when youre done.
//                       </DialogDescription>
//                     </DialogHeader>
//                     <div className="grid gap-4 py-4">
//                       <div className="items-center">
//                         <Label htmlFor="totonbank" className="text-right">
//                           Total on Bank
//                         </Label>
//                         <Input
//                           id="totonbank"
//                           value={formatNumber(totonbank.toString())}
//                           placeholder="0.00"
//                           onChange={(e) => {
//                             const rawValue = e.target.value.replace(/,/g, '');
//                             setTotonbank(parseFloat(rawValue));
//                           }}
//                         />
//                       </div>
//                     </div>
//                     <DialogFooter>
//                       <Button
//                         type="button"
//                         onClick={handleSave}
//                         disabled={loading}
//                       >
//                         {loading ? 'Saving...' : 'Save changes'}
//                       </Button>
//                     </DialogFooter>
//                   </DialogContent>
//                 </Dialog>
//                 {/* </Card> */}
//               </BackgroundGradient>
//               <BackgroundGradient className="h-full w-full rounded-md bg-white dark:bg-neutral-900">
//                 {/* <Card className="shadow-[rgba(0,0,0,0.2)_5px_5px_4px_0px]"> */}
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-xl font-thin text-muted-foreground">
//                     Total Interest Earned
//                   </CardTitle>
//                   <HandCoins color="#333333" strokeWidth={1.5} />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {loading ? (
//                       <Skeleton className="h-8 w-[200px] sm:w-[100px] md:w-[100px] lg:w-[240px]" />
//                     ) : (
//                       new Intl.NumberFormat('en-PH', {
//                         style: 'currency',
//                         currency: 'PHP'
//                       }).format(totalInterest)
//                     )}
//                   </div>
//                   <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
//                     <Badge
//                       variant="outline"
//                       className={
//                         getPercentageChangeTotalIntEarned() < 0
//                           ? 'border-[#ef4444]/0 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/10'
//                           : 'border-[#10b981]/0 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/10'
//                       }
//                     >
//                       {getPercentageChangeTotalIntEarned() < 0 ? (
//                         <TrendingDown className="mr-1 h-4 w-4" />
//                       ) : (
//                         <TrendingUp className="mr-1 h-4 w-4" />
//                       )}
//                       {getPercentageChangeTotalIntEarned()}%
//                     </Badge>
//                     From Last Month
//                   </div>
//                 </CardContent>
//                 {/* </Card> */}
//               </BackgroundGradient>
//               <BackgroundGradient className="h-full w-full rounded-md bg-white dark:bg-neutral-900">
//                 {/* <Card className="shadow-[rgba(0,0,0,0.2)_5px_5px_4px_0px]"> */}
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="md:text-md text-xl font-thin text-muted-foreground">
//                     Savings & Interest
//                   </CardTitle>
//                   <Wallet color="#333333" strokeWidth={1.5} />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {loading ? (
//                       <Skeleton className="h-8 w-[200px] sm:w-[100px] md:w-[100px] lg:w-[240px]" />
//                     ) : (
//                       new Intl.NumberFormat('en-PH', {
//                         style: 'currency',
//                         currency: 'PHP'
//                       }).format(savingsAndInterest)
//                     )}
//                   </div>
//                   <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
//                     <Badge
//                       variant="outline"
//                       className={
//                         getPercentageChangeTotalSavIntEarned() < 0
//                           ? 'border-[#ef4444]/0 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/10'
//                           : 'border-[#10b981]/0 bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/10'
//                       }
//                     >
//                       {getPercentageChangeTotalSavIntEarned() < 0 ? (
//                         <TrendingDown className="mr-1 h-4 w-4" />
//                       ) : (
//                         <TrendingUp className="mr-1 h-4 w-4" />
//                       )}
//                         {getPercentageChangeTotalSavIntEarned()}%
//                     </Badge>
//                     From Last Month
//                   </div>
//                 </CardContent>
//                 {/* </Card> */}
//               </BackgroundGradient>
//             </div>
//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
//               <div className="col-span-4 space-y-4">
//                 <AmountBalances />
//                 <BarChart />
//               </div>
//               <div className="col-span-4 md:col-span-3">
//                 <ToCollect />
//               </div>
//               <div className="col-span-4 grid grid-cols-1 gap-4 md:grid-cols-2">
//                 {/* <TopLoaner /> */}
//                 <MonthLoan />
//                 {/* <AreaGraph /> */}
//                 <TotalLoans />
//               </div>
//               <div className="col-span-4 min-h-[300px] md:col-span-3">
//                 {/* <PieGraph /> */}
//                 <TopLoaner />
//               </div>
//             </div>
//           </TabsContent>

//           {/*___________________________Analytics___________________________*/}

//           <TabsContent value="analytics">
//             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//               <AnimatedBorderTrail
//                 trailSize="lg"
//                 duration="2s"
//                 className="light:bg-white w-full rounded-md dark:bg-zinc-800"
//                 contentClassName="rounded-md bg-neutral-900"
//                 trailColor="pink"
//               >
//                 {/* <Card className="relative shadow-[rgba(0,0,0,0.2)_5px_5px_4px_0px]"> */}
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-xl font-thin text-muted-foreground">
//                     Capital (2023)
//                   </CardTitle>
//                   <Landmark size={24} color="#333333" strokeWidth={1.5} />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {loading ? (
//                       <Skeleton className="h-8 w-[200px] sm:w-[100px] md:w-[100px] lg:w-[240px]" />
//                     ) : (
//                       new Intl.NumberFormat('en-PH', {
//                         style: 'currency',
//                         currency: 'PHP'
//                       }).format(Number(data?.capital ?? 0))
//                     )}
//                   </div>
//                   <p className="pt-2 text-xs text-muted-foreground">
//                     +180.1% from last month
//                   </p>
//                 </CardContent>
//                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                   <DialogTrigger className="absolute bottom-4 right-4 p-2">
//                     <Edit size={24} color="#333333" strokeWidth={1.5} />
//                   </DialogTrigger>
//                   <DialogContent className="sm:max-w-[425px]">
//                     <DialogHeader>
//                       <DialogTitle>Edit Current on Bank</DialogTitle>
//                       <DialogDescription>
//                         Make changes to the total amount on bank here. Click
//                         save when youre done.
//                       </DialogDescription>
//                     </DialogHeader>
//                     <div className="grid gap-4 py-4">
//                       <div className="items-center">
//                         <Label htmlFor="totonbank" className="text-right">
//                           Total on Bank
//                         </Label>
//                         <Input
//                           id="totonbank"
//                           value={formatNumber(totonbank.toString())}
//                           placeholder="0.00"
//                           onChange={(e) => {
//                             const rawValue = e.target.value.replace(/,/g, '');
//                             setTotonbank(parseFloat(rawValue));
//                           }}
//                         />
//                       </div>
//                     </div>
//                     <DialogFooter>
//                       <Button
//                         type="button"
//                         onClick={handleSave}
//                         disabled={loading}
//                       >
//                         {loading ? 'Saving...' : 'Save changes'}
//                       </Button>
//                     </DialogFooter>
//                   </DialogContent>
//                 </Dialog>
//                 {/* </Card> */}
//               </AnimatedBorderTrail>
//               <AnimatedBorderTrail
//                 trailSize="lg"
//                 duration="3s"
//                 className="w-full rounded-md bg-zinc-800"
//                 contentClassName="rounded-md bg-neutral-900"
//                 trailColor="lightblue"
//               >
//                 {/* <Card className="relative shadow-[rgba(0,0,0,0.2)_5px_5px_4px_0px]"> */}
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-xl font-thin text-muted-foreground">
//                     Available on Bank
//                   </CardTitle>
//                   <Landmark size={24} color="#333333" strokeWidth={1.5} />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {loading ? (
//                       <Skeleton className="h-8 w-[200px] sm:w-[100px] md:w-[100px] lg:w-[240px]" />
//                     ) : (
//                       new Intl.NumberFormat('en-PH', {
//                         style: 'currency',
//                         currency: 'PHP'
//                       }).format(Number(data?.totonbank ?? 0))
//                     )}
//                   </div>
//                   <p className="pt-2 text-xs text-muted-foreground">
//                     +180.1% from last month
//                   </p>
//                 </CardContent>
//                 {/* </Card> */}
//               </AnimatedBorderTrail>
//               <AnimatedBorderTrail
//                 trailSize="lg"
//                 duration="4s"
//                 className="w-full rounded-md bg-zinc-800"
//                 contentClassName="rounded-md bg-neutral-900"
//                 trailColor="lightgreen"
//               >
//                 {/* <Card className="shadow-[rgba(0,0,0,0.2)_5px_5px_4px_0px]"> */}
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="md:text-md text-xl font-thin text-muted-foreground">
//                     Amount Receivables
//                   </CardTitle>
//                   <Wallet color="#333333" strokeWidth={1.5} />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {loading ? (
//                       <Skeleton className="h-8 w-[200px] sm:w-[100px] md:w-[100px] lg:w-[240px]" />
//                     ) : (
//                       new Intl.NumberFormat('en-PH', {
//                         style: 'currency',
//                         currency: 'PHP'
//                       }).format(totalReceivables?.totalReceivables ?? 0)
//                     )}
//                   </div>
//                   <p className="pt-2 text-xs text-muted-foreground">
//                     +201 since last hour
//                   </p>
//                 </CardContent>
//                 {/* </Card> */}
//               </AnimatedBorderTrail>
//               <AnimatedBorderTrail
//                 trailSize="lg"
//                 duration="5s"
//                 className="w-full rounded-md bg-zinc-800"
//                 contentClassName="rounded-md bg-neutral-900"
//                 trailColor="yellow"
//               >
//                 {/* <Card className="shadow-[rgba(0,0,0,0.2)_5px_5px_4px_0px]"> */}
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-xl font-thin text-muted-foreground">
//                     Service Charge
//                   </CardTitle>
//                   <DollarSignIcon color="#333333" strokeWidth={1.5} />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {loading ? (
//                       <Skeleton className="h-8 w-[200px] sm:w-[100px] md:w-[100px] lg:w-[240px]" />
//                     ) : (
//                       new Intl.NumberFormat('en-PH', {
//                         style: 'currency',
//                         currency: 'PHP'
//                       }).format(totalservcharge?.totalservcharge ?? 0)
//                     )}
//                   </div>
//                   <p className="pt-2 text-xs text-muted-foreground">
//                     +19% from last month
//                   </p>
//                 </CardContent>
//                 {/* </Card> */}
//               </AnimatedBorderTrail>

//               {/*____________________Second Layout____________________*/}

//               <AnimatedBorderTrail
//                 trailSize="lg"
//                 duration="6s"
//                 className="w-full rounded-md bg-zinc-800"
//                 contentClassName="rounded-md bg-neutral-900"
//                 trailColor="red"
//               >
//                 {/* <Card className="relative shadow-[rgba(0,0,0,0.2)_5px_5px_4px_0px]"> */}
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-xl font-thin text-muted-foreground">
//                     Equity
//                   </CardTitle>
//                   {/* Total Assets */}
//                   <Triangle size={24} color="#333333" strokeWidth={1.5} />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {loading ? (
//                       <Skeleton className="h-8 w-[200px] sm:w-[100px] md:w-[100px] lg:w-[240px]" />
//                     ) : (
//                       new Intl.NumberFormat('en-PH', {
//                         style: 'currency',
//                         currency: 'PHP'
//                       }).format(Number(data?.totsavings ?? 0))
//                     )}
//                   </div>
//                   <p className="pt-2 text-xs text-muted-foreground">
//                     +180.1% from last month
//                   </p>
//                 </CardContent>
//                 {/* </Card> */}
//               </AnimatedBorderTrail>
//               <AnimatedBorderTrail
//                 trailSize="lg"
//                 duration="7s"
//                 className="w-full rounded-md bg-zinc-800"
//                 contentClassName="rounded-md bg-neutral-900"
//                 trailColor="orange"
//               >
//                 {/* <Card className="relative shadow-[rgba(0,0,0,0.2)_5px_5px_4px_0px]"> */}
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-xl font-thin text-muted-foreground">
//                     Interest Received
//                   </CardTitle>
//                   <CheckCheckIcon size={24} color="#333333" strokeWidth={1.5} />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {loading ? (
//                       <Skeleton className="h-8 w-[200px] sm:w-[100px] md:w-[100px] lg:w-[240px]" />
//                     ) : (
//                       new Intl.NumberFormat('en-PH', {
//                         style: 'currency',
//                         currency: 'PHP'
//                       }).format(
//                         totalInterestReceived?.totalInterestReceived ?? 0
//                       )
//                     )}
//                   </div>
//                   <p className="pt-2 text-xs text-muted-foreground">
//                     +180.1% from last month
//                   </p>
//                 </CardContent>
//                 {/* </Card> */}
//               </AnimatedBorderTrail>
//               <AnimatedBorderTrail
//                 trailSize="lg"
//                 duration="8s"
//                 className="w-full rounded-md bg-zinc-800"
//                 contentClassName="rounded-md bg-neutral-900"
//                 trailColor="violet"
//               >
//                 {/* <Card className="shadow-[rgba(0,0,0,0.2)_5px_5px_4px_0px]"> */}
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="md:text-md text-l font-thin">
//                     Pending Interest
//                   </CardTitle>
//                   <CircleDot color="#333333" strokeWidth={1.5} />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {loading ? (
//                       <Skeleton className="h-8 w-[200px] sm:w-[100px] md:w-[100px] lg:w-[240px]" />
//                     ) : (
//                       new Intl.NumberFormat('en-PH', {
//                         style: 'currency',
//                         currency: 'PHP'
//                       }).format(totalPendingInterest?.totalPendingInterest ?? 0)
//                     )}
//                   </div>
//                   <p className="pt-2 text-xs text-muted-foreground">
//                     +201 since last hour
//                   </p>
//                 </CardContent>
//                 {/* </Card> */}
//               </AnimatedBorderTrail>
//               <AnimatedBorderTrail
//                 trailSize="lg"
//                 duration="9s"
//                 className="w-full rounded-md bg-zinc-800"
//                 contentClassName="rounded-md bg-neutral-900"
//                 trailColor="indigo"
//               >
//                 {/* <Card className="shadow-[rgba(0,0,0,0.2)_5px_5px_4px_0px]"> */}
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-l font-thin">
//                     Paid Penalty
//                   </CardTitle>
//                   <OctagonAlertIcon color="#333333" strokeWidth={1.5} />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {loading ? (
//                       <Skeleton className="h-8 w-[200px] sm:w-[100px] md:w-[100px] lg:w-[240px]" />
//                     ) : (
//                       new Intl.NumberFormat('en-PH', {
//                         style: 'currency',
//                         currency: 'PHP'
//                       }).format(totalPaidPenalty?.totalpaidpenalty ?? 0)
//                     )}
//                   </div>
//                   <p className="pt-2 text-xs text-muted-foreground">
//                     +19% from last month
//                   </p>
//                 </CardContent>
//                 {/* </Card> */}
//               </AnimatedBorderTrail>
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>
//       <SiteFooter />
//     </PageContainer>
//   );
// }
