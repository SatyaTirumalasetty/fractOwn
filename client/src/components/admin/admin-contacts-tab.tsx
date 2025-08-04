import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Eye, Mail, Phone, User } from "lucide-react";
import { type Contact } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function AdminContactsTab() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["/api/contacts"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/contacts/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Contact Deleted",
        description: "The contact inquiry has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete contact",
        variant: "destructive",
      });
    },
  });

  const handleView = (contact: Contact) => {
    setSelectedContact(contact);
    setIsViewOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this contact inquiry?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: string) => {
    const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (isNaN(numAmount)) return amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  if (isLoading) {
    return <div>Loading contacts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Contact Inquiries ({contacts.length})</h3>
      </div>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contact inquiries</h3>
            <p className="text-gray-500 text-center">
              When users submit contact forms, they will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact Information</TableHead>
                <TableHead>Investment Amount</TableHead>
                <TableHead>Date Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact: Contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{contact.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Mail className="h-4 w-4" />
                        <span>{contact.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Phone className="h-4 w-4" />
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {formatCurrency(contact.investmentAmount)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {formatDate(contact.createdAt.toString())}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleView(contact)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(contact.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* View Contact Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Inquiry Details</DialogTitle>
            <DialogDescription>
              Full details of the contact inquiry
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-base">{selectedContact.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-base">{selectedContact.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-base">{selectedContact.phone}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Investment Amount</label>
                    <p className="text-base font-medium">
                      {formatCurrency(selectedContact.investmentAmount)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date Submitted</label>
                    <p className="text-base">
                      {formatDate(selectedContact.createdAt.toString())}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Message</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-base whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => window.open(`mailto:${selectedContact.email}`, '_blank')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Reply via Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}