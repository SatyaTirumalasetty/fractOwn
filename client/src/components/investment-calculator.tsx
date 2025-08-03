import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function InvestmentCalculator() {
  const [investment, setInvestment] = useState(50000);
  const [returnRate, setReturnRate] = useState([10]);
  const [period, setPeriod] = useState("3");

  const calculateReturns = () => {
    const monthlyRentalRate = returnRate[0] / 12 / 100;
    const monthlyIncome = investment * monthlyRentalRate;
    const annualIncome = monthlyIncome * 12;
    const valueGrowthRate = returnRate[0] * 0.3 / 100; // Assuming property appreciation is 30% of rental yield
    const valueGrowth = investment * valueGrowthRate * parseInt(period);
    const totalReturn = annualIncome * parseInt(period) + valueGrowth;
    const roi = ((totalReturn / investment) * 100).toFixed(0);

    return {
      monthlyIncome: monthlyIncome.toLocaleString('en-IN'),
      annualIncome: annualIncome.toLocaleString('en-IN'),
      valueGrowth: valueGrowth.toLocaleString('en-IN'),
      totalReturn: totalReturn.toLocaleString('en-IN'),
      roi
    };
  };

  const returns = calculateReturns();

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Calculate Your Returns</h2>
          <p className="text-xl text-gray-600">See how your investment can grow over time</p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Investment Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    type="number"
                    value={investment}
                    onChange={(e) => setInvestment(Number(e.target.value))}
                    placeholder="50000"
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Expected Annual Return</Label>
                <div className="relative">
                  <Slider
                    value={returnRate}
                    onValueChange={setReturnRate}
                    max={15}
                    min={6}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>6%</span>
                    <span>{returnRate[0]}%</span>
                    <span>15%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Investment Period</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Year</SelectItem>
                    <SelectItem value="3">3 Years</SelectItem>
                    <SelectItem value="5">5 Years</SelectItem>
                    <SelectItem value="10">10 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Projected Returns</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Rental Income</span>
                    <span className="font-semibold text-fractown-secondary">₹{returns.monthlyIncome}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Annual Rental Income</span>
                    <span className="font-semibold text-fractown-secondary">₹{returns.annualIncome}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Property Value Growth</span>
                    <span className="font-semibold text-fractown-primary">₹{returns.valueGrowth}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold text-gray-900">Total Return ({period} Years)</span>
                    <span className="font-bold text-fractown-accent text-xl">₹{returns.totalReturn}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Total ROI: <span className="font-semibold text-fractown-secondary">{returns.roi}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
