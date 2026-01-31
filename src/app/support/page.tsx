
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import { ShieldCheck, Lock, HelpCircle } from "lucide-react";

export default function SupportPage() {
    return (
        <div className="container max-w-4xl py-12">
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl font-bold tracking-tight">Login Support</h1>
                <p className="text-muted-foreground text-lg">
                    Everything you need to know about accessing your Gainzio account.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Helper Content */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-primary" />
                                Accessing Your Account
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-muted/50 rounded-lg text-sm">
                                You can log in using your <strong>Username</strong>, <strong>Email</strong>, or <strong>Phone Number</strong>.
                                <br /><br />
                                All accounts use a single unique password. We do not use OTPs for login to prevent SIM swapping attacks.
                            </div>
                            <Button className="w-full" asChild>
                                <Link href="/login">Go to Login</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-green-600" />
                                Security Features
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>✓ <strong>Zero Data Leakage:</strong> We never reveal if an account exists during login.</p>
                            <p>✓ <strong>Rate Limiting:</strong> Multiple failed attempts will temporarily lock your account.</p>
                            <p>✓ <strong>Device Memory:</strong> We securely track known devices to prevent unauthorized access.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* FAQ */}
                <div>
                    <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>I forgot my password. How do I reset it?</AccordionTrigger>
                            <AccordionContent>
                                To reset your password, click "Forgot Password" on the login page. You will need to provide
                                <strong> ANY TWO</strong> details associated with your account (e.g., Username + Email, or Phone + Email).
                                This ensures only the real owner can reset credentials.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Why is there no OTP?</AccordionTrigger>
                            <AccordionContent>
                                SMS OTPs are vulnerable to interception and SIM swapping. By using a strong password and multi-factor
                                identity verification for resets, we provide higher security without the hassle of waiting for codes.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>My account is locked.</AccordionTrigger>
                            <AccordionContent>
                                If you enter the wrong password 5 times, your account will be locked for 15 minutes.
                                Please wait and try again, or use the Forgot Password feature to reset your access.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>I need further assistance.</AccordionTrigger>
                            <AccordionContent>
                                If you cannot access your account using any of the methods above, please contact our support team
                                at <strong>support@gainzio.com</strong>.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </div>
    );
}
