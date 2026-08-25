import Link from "next/link";

export default function NotFound() { return ( <div className="min-h-screen flex items-center justify-center"> <div className="text-center"> <h1 className="text-4xl font-bold text-foreground">404</h1> <p className="text-muted-foreground mt-2">Página no encontrada</p> <Link href="/dashboard" className="text-primary hover:underline mt-4 inline-block"> Volver al dashboard </Link> </div> </div> );
}
