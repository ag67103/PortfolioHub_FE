import { useAuth } from "../../context/AuthContext";
import { ContactMeForm } from "../forms/ContactMeForm";

const ContactSection = () => {
    const { isMe } = useAuth();

    return (
        <section id="contact" className="section-surface py-20">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="font-grotesk text-4xl font-bold text-ink-primary">
                        {isMe ? 'Messages' : 'Get In Touch'}
                    </h2>
                    {!isMe && (
                        <p className="text-ink-secondary mt-3 max-w-md mx-auto">
                            Have a question or want to work together? Drop a message below.
                        </p>
                    )}
                </div>
                <div className="max-w-2xl mx-auto">
                    <ContactMeForm />
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
