import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface Species {
  id: number;
  author: string;
  scientific_name: string;
  common_name: string | null;
  kingdom: "Animalia" | "Plantae" | "Fungi" | "Protista" | "Archaea" | "Bacteria";
  total_population: number | null;
  description: string | null;
  image: string | null;
}

interface EditSpeciesDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  species: Species;
  onSpeciesUpdated: (updatedSpecies: Species) => void;
}

// Zod schema to validate the form fields
const speciesSchema = z.object({
  scientific_name: z.string().min(1, { message: "Scientific name is required" }),
  common_name: z.string().nullable(),
  kingdom: z.enum(["Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"]),
  total_population: z.number().nullable(),
  description: z.string().nullable(),
});

type FormData = z.infer<typeof speciesSchema>;

export default function EditSpeciesDialog({ open, setOpen, species, onSpeciesUpdated }: EditSpeciesDialogProps) {
  const [loading, setLoading] = useState(false);

  // Prepopulate the form with species data
  const form = useForm<FormData>({
    resolver: zodResolver(speciesSchema),
    defaultValues: {
      scientific_name: species.scientific_name,
      common_name: species.common_name,
      kingdom: species.kingdom,
      total_population: species.total_population,
      description: species.description,
    },
  });

  const doOnSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from("species")
        .update({
          scientific_name: data.scientific_name,
          common_name: data.common_name,
          kingdom: data.kingdom,
          total_population: data.total_population,
          description: data.description,
        })
        .eq("id", species.id);

      if (error) {
        throw error;
      }

      onSpeciesUpdated({
        ...species,
        scientific_name: data.scientific_name,
        common_name: data.common_name,
        kingdom: data.kingdom,
        total_population: data.total_population,
        description: data.description,
      });

      toast({
        title: "Species updated",
        description: "The species information has been updated successfully.",
      });

      setOpen(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: "Error updating species",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Species</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e: BaseSyntheticEvent) => void form.handleSubmit(doOnSubmit)(e)} className="grid gap-4">
          <div>
            <label>Scientific Name</label>
            <Input {...form.register("scientific_name")} />
          </div>
          <div>
            <label>Common Name</label>
            <Input {...form.register("common_name")} />
          </div>
          <div>
            <label>Kingdom</label>
            <select {...form.register("kingdom")} className="rounded border p-2">
              <option value="Animalia">Animalia</option>
              <option value="Plantae">Plantae</option>
              <option value="Fungi">Fungi</option>
              <option value="Protista">Protista</option>
              <option value="Archaea">Archaea</option>
              <option value="Bacteria">Bacteria</option>
            </select>
          </div>
          <div>
            <label>Total Population</label>
            <Input
              type="number"
              {...form.register("total_population", {
                setValueAs: (value: string) => (value === "" ? null : parseInt(value, 10)),
              })}
            />
          </div>
          <div>
            <label>Description</label>
            <Textarea {...form.register("description")} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Species"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
