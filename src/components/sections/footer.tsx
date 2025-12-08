import { Button } from "../ui/button";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300" id="contact">
      <div className="container py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
          <div>
            <h3 className="font-bold text-white">Solutions</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="hover:text-white">Virtual Receptionists</a></li>
              <li><a href="#" className="hover:text-white">Live Chat</a></li>
              <li><a href="#" className="hover:text-white">AI Chatbot</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white">Features</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="hover:text-white">Lead Intake & Screening</a></li>
              <li><a href="#" className="hover:text-white">Appointment Booking</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white">Industries</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="hover:text-white">Law Firms</a></li>
              <li><a href="#" className="hover:text-white">Home Services</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white">For Business</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="hover:text-white">Solo & Small</a></li>
              <li><a href="#" className="hover:text-white">Mid-Market</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white">For Partners</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="hover:text-white">Partner Programs</a></li>
              <li><a href="#" className="hover:text-white">Affiliate</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="hover:text-white">About Smith.ai</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-gray-400">© {new Date().getFullYear()} Smith.ai, Inc. All Rights Reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
                <a href="#" className="text-sm hover:text-white">Terms of Service</a>
                <a href="#" className="text-sm hover:text-white">Privacy Policy</a>
            </div>
        </div>
      </div>
    </footer>
  );
}
