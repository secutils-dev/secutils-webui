import React, { useContext } from 'react';
import {
  EuiLink,
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageSection,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { PageContext } from '../../page_container';
import { usePageMeta } from '../../hooks';

export function TermsPage() {
  usePageMeta('Terms of Use');

  const { getURL } = useContext(PageContext);
  return (
    <EuiPage grow direction={'row'}>
      <EuiPageBody paddingSize="none" panelled>
        <EuiPageSection bottomBorder>
          <EuiPageHeader pageTitle="Terms of Use" />
        </EuiPageSection>
        <EuiPageSection color="plain" grow>
          <EuiTitle size={'xs'}>
            <h3>AGREEMENT TO TERMS</h3>
          </EuiTitle>
          <EuiText>
            <p>
              These Terms of Use constitute a legally binding agreement made between you, whether personally or on
              behalf of an entity (“you”) and Secutils.dev ("Company", “we”, “us”, or “our”), concerning your access to
              and use of the https://secutils.dev website as well as any other media form, media channel, mobile website
              or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”). You
              agree that by accessing the Site, you have read, understood, and agree to be bound by all of these Terms
              of Use. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF USE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING
              THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY."
            </p>
            <p>
              Supplemental terms and conditions or documents that may be posted on the Site from time to time are hereby
              expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes
              or modifications to these Terms of Use at any time and for any reason. We will alert you about any changes
              by updating the "Last updated" date of these Terms of Use, and you waive any right to receive specific
              notice of each such change. It is your responsibility to periodically review these Terms of Use to stay
              informed of updates. You will be subject to, and will be deemed to have been made aware of and to have
              accepted, the changes in any revised Terms of Use by your continued use of the Site after the date such
              revised Terms of Use are posted.
            </p>
            <p>
              The information provided on the Site is not intended for distribution to or use by any person or entity in
              any jurisdiction or country where such distribution or use would be contrary to law or regulation or which
              would subject us to any registration requirement within such jurisdiction or country. Accordingly, those
              persons who choose to access the Site from other locations do so on their own initiative and are solely
              responsible for compliance with local laws, if and to the extent local laws are applicable.
            </p>
            <p>
              All users who are minors in the jurisdiction in which they reside (generally under the age of 18) must
              have the permission of, and be directly supervised by, their parent or guardian to use the Site. If you
              are a minor, you must have your parent or guardian read and agree to these Terms of Use prior to you using
              the Site.
            </p>
          </EuiText>
          <EuiSpacer />
          <EuiTitle size={'xs'}>
            <h3>INTELLECTUAL PROPERTY RIGHTS</h3>
          </EuiTitle>
          <EuiText>
            <p>
              Unless otherwise indicated, the Site is our proprietary property and all source code, databases,
              functionality, software, website designs, audio, video, text, photographs, and graphics on the Site
              (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”)
              are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and
              various other intellectual property rights and unfair competition laws of the Federal Republic of Germany,
              international copyright laws, and international conventions. The Content and the Marks are provided on the
              Site “AS IS” for your information and personal use only. Except as expressly provided in these Terms of
              Use, no part of the Site and no Content or Marks may be copied, reproduced, aggregated, republished,
              uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or
              otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
            </p>
            <p>
              Provided that you are eligible to use the Site, you are granted a limited license to access and use the
              Site and to download or print a copy of any portion of the Content to which you have properly gained
              access solely for your personal, non-commercial use. We reserve all rights not expressly granted to you in
              and to the Site, the Content and the Marks.
            </p>
          </EuiText>
          <EuiSpacer />
          <EuiTitle size={'xs'}>
            <h3>USER REPRESENTATIONS</h3>
          </EuiTitle>
          <EuiText>
            <p>
              By using the Site, you represent and warrant that: (1) you have the legal capacity and you agree to comply
              with these Terms of Use; (2) you are not a minor in the jurisdiction in which you reside, or if a minor,
              you have received parental permission to use the Site; (3) you will not access the Site through automated
              or non-human means, whether through a bot, script or otherwise; (4) you will not use the Site for any
              illegal or unauthorized purpose; and (5) your use of the Site will not violate any applicable law or
              regulation.
            </p>
            <p>
              If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right
              to refuse any and all current or future use of the Site (or any portion thereof).
            </p>
          </EuiText>
          <EuiSpacer />
          <EuiTitle size={'xs'}>
            <h3>PROHIBITED ACTIVITIES</h3>
          </EuiTitle>
          <EuiText>
            <p>
              You may not access or use the Site for any purpose other than that for which we make the Site available.
              The Site may not be used in connection with any commercial endeavors except those that are specifically
              endorsed or approved by us.
            </p>
            <p>As a user of the Site, you agree not to:</p>
            <ol>
              <li>
                Systematically retrieve data or other content from the Site to create or compile, directly or
                indirectly, a collection, compilation, database, or directory without written permission from us.
              </li>
              <li>
                Circumvent, disable, or otherwise interfere with security-related features of the Site, including
                features that prevent or restrict the use or copying of any Content or enforce limitations on the use of
                the Site and/or the Content contained therein.
              </li>
              <li>Engage in unauthorized framing of or linking to the Site.</li>
              <li>
                Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account
                information such as user passwords.
              </li>
              <li>Make improper use of our support services or submit false reports of abuse or misconduct.</li>
              <li>
                Engage in any automated use of the system, such as using scripts to send comments or messages, or using
                any data mining, robots, or similar data gathering and extraction tools.
              </li>
              <li>
                Interfere with, disrupt, or create an undue burden on the Site or the networks or services connected to
                the Site.
              </li>
              <li>
                Use the Site as part of any effort to compete with us or otherwise use the Site and/or the Content for
                any revenue-generating endeavor or commercial enterprise.
              </li>
              <li>
                Attempt to bypass any measures of the Site designed to prevent or restrict access to the Site, or any
                portion of the Site.
              </li>
              <li>Delete the copyright or other proprietary rights notice from any Content.</li>
              <li>Copy or adapt the Site’s software, including but not limited to HTML, JavaScript, or other code.</li>
              <li>
                Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material and
                spamming (continuous posting of repetitive text), that interferes with any party’s uninterrupted use and
                enjoyment of the Site or modifies, impairs, disrupts, alters, or interferes with the use, features,
                functions, operation, or maintenance of the Site.
              </li>
              <li>
                Upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active
                information collection or transmission mechanism, including without limitation, clear graphics
                interchange formats (“gifs”), 1×1 pixels, web bugs, cookies, or other similar devices (sometimes
                referred to as “spyware” or “passive collection mechanisms” or “pcms”).
              </li>
              <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Site.</li>
              <li>Use the Site in a manner inconsistent with any applicable laws or regulations.</li>
              <li>
                Except as may be the result of standard search engine or Internet browser usage, use, launch, develop,
                or distribute any automated system, including without limitation, any spider, robot, cheat utility,
                scraper, or offline reader that accesses the Site, or using or launching any unauthorized script or
                other software.
              </li>
            </ol>
          </EuiText>
          <EuiSpacer />
          <EuiTitle size={'xs'}>
            <h3>SUBMISSIONS</h3>
          </EuiTitle>
          <EuiText>
            <p>
              You acknowledge and agree that any questions, comments, suggestions, ideas, feedback, or other information
              regarding the Site ("Submissions") provided by you to us are non-confidential and shall become our sole
              property. We shall own exclusive rights, including all intellectual property rights, and shall be entitled
              to the unrestricted use and dissemination of these Submissions for any lawful purpose, commercial or
              otherwise, without acknowledgment or compensation to you. You hereby waive all moral rights to any such
              Submissions, and you hereby warrant that any such Submissions are original with you or that you have the
              right to submit such Submissions. You agree there shall be no recourse against us for any alleged or
              actual infringement or misappropriation of any proprietary right in your Submissions.
            </p>
          </EuiText>
          <EuiSpacer />
          <EuiTitle size={'xs'}>
            <h3>THIRD-PARTY WEBSITES AND CONTENT</h3>
          </EuiTitle>
          <EuiText>
            <p>
              The Site may contain (or you may be sent via the Site) links to other websites ("Third-Party Websites") as
              well as articles, photographs, text, graphics, pictures, designs, music, sound, video, information,
              applications, software, and other content or items belonging to or originating from third parties
              ("Third-Party Content"). Such Third-Party Websites and Third-Party Content are not investigated,
              monitored, or checked for accuracy, appropriateness, or completeness by us, and we are not responsible for
              any Third-Party Websites accessed through the Site or any Third-Party Content posted on, available
              through, or installed from the Site, including the content, accuracy, offensiveness, opinions,
              reliability, privacy practices, or other policies of or contained in the Third-Party Websites or the
              Third-Party Content. Inclusion of, linking to, or permitting the use or installation of any Third-Party
              Websites or any Third-Party Content does not imply approval or endorsement thereof by us. If you decide to
              leave the Site and access the Third-Party Websites or to use or install any Third-Party Content, you do so
              at your own risk, and you should be aware these Terms of Use no longer govern. You should review the
              applicable terms and policies, including privacy and data gathering practices, of any website to which you
              navigate from the Site or relating to any applications you use or install from the Site. Any purchases you
              make through Third-Party Websites will be through other websites and from other companies, and we take no
              responsibility whatsoever in relation to such purchases which are exclusively between you and the
              applicable third party. You agree and acknowledge that we do not endorse the products or services offered
              on Third-Party Websites and you shall hold us harmless from any harm caused by your purchase of such
              products or services. Additionally, you shall hold us harmless from any losses sustained by you or harm
              caused to you relating to or resulting in any way from any Third-Party Content or any contact with
              Third-Party Websites.
            </p>
          </EuiText>
          <EuiTitle size={'xs'}>
            <h3>SITE MANAGEMENT</h3>
          </EuiTitle>
          <EuiText>
            <p>
              We reserve the right, but not the obligation, to: (1) monitor the Site for violations of these Terms of
              Use; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or
              these Terms of Use, including without limitation, reporting such user to law enforcement authorities; (3)
              in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or
              disable (to the extent technologically feasible) any of your Contributions or any portion thereof; (4) in
              our sole discretion and without limitation, notice, or liability, to remove from the Site or otherwise
              disable all files and content that are excessive in size or are in any way burdensome to our systems; and
              (5) otherwise manage the Site in a manner designed to protect our rights and property and to facilitate
              the proper functioning of the Site.
            </p>
          </EuiText>
          <EuiSpacer />
          <EuiTitle size={'xs'}>
            <h3>PRIVACY POLICY</h3>
          </EuiTitle>
          <EuiText>
            <p>
              Please review our Privacy Policy:{' '}
              <EuiLink href={getURL('/privacy')}>{`https://secutils.dev${getURL('/privacy')}`}</EuiLink>. By using the
              Site, you agree to be bound by our Privacy Policy, which is incorporated into these Terms of Use. Please
              be advised the Site is hosted in the Federal Republic of Germany. If you access the Site from any other
              region of the world with laws or other requirements governing personal data collection, use, or disclosure
              that differ from applicable laws in the Federal Republic of Germany, then through your continued use of
              the Site, you are transferring your data to the Federal Republic of Germany, and you agree to have your
              data transferred to and processed in the Federal Republic of Germany.
            </p>
          </EuiText>
          <EuiSpacer />
          <EuiTitle size={'xs'}>
            <h3>COPYRIGHT INFRINGEMENTS</h3>
          </EuiTitle>
          <EuiText>
            <p>
              If you believe that any material available on or through the Site infringes upon any copyright you own or
              control, please immediately notify us using the contact information provided below (a “Notification”).
              Please be advised that pursuant to applicable law you may be held liable for damages if you make material
              misrepresentations in a Notification. Thus, if you are not sure that material located on or linked to by
              the Site infringes your copyright, you should consider first contacting an attorney.
            </p>
          </EuiText>
          <EuiSpacer />
          <EuiTitle size={'xs'}>
            <h3>TERM AND TERMINATION</h3>
          </EuiTitle>
          <EuiText>
            <p>
              These Terms of Use shall remain in full force and effect while you use the Site. WITHOUT LIMITING ANY
              OTHER PROVISION OF THESE TERMS OF USE, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE
              OR LIABILITY, DENY ACCESS TO AND USE OF THE SITE (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON
              FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY,
              OR COVENANT CONTAINED IN THESE TERMS OF USE OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE YOUR
              USE OR PARTICIPATION IN THE SITE, WITHOUT WARNING, IN OUR SOLE DISCRETION.
            </p>
          </EuiText>
          <EuiSpacer />
          <EuiTitle size={'xs'}>
            <h3>MODIFICATIONS AND INTERRUPTIONS</h3>
          </EuiTitle>
          <EuiText>
            <p>
              We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason
              at our sole discretion without notice. However, we have no obligation to update any information on our
              Site. We also reserve the right to modify or discontinue all or part of the Site without notice at any
              time. We will not be liable to you or any third party for any modification, suspension, or discontinuance
              of the Site.
            </p>
            <p>
              We cannot guarantee the Site will be available at all times. We may experience hardware, software, or
              other problems or need to perform maintenance related to the Site, resulting in interruptions, delays, or
              errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Site
              at any time or for any reason without notice to you. You agree that we have no liability whatsoever for
              any loss, damage, or inconvenience caused by your inability to access or use the Site during any downtime
              or discontinuance of the Site. Nothing in these Terms of Use will be construed to obligate us to maintain
              and support the Site or to supply any corrections, updates, or releases in connection therewith.
            </p>
          </EuiText>
          <EuiSpacer />
          <EuiTitle size={'xs'}>
            <h3>CORRECTIONS</h3>
          </EuiTitle>
          <EuiText>
            <p>
              There may be information on the Site that contains typographical errors, inaccuracies, or omissions,
              including descriptions, pricing, availability, and various other information. We reserve the right to
              correct any errors, inaccuracies, or omissions and to change or update the information on the Site at any
              time, without prior notice.
            </p>
          </EuiText>
          <EuiSpacer />
          <EuiTitle size={'xs'}>
            <h3>DISCLAIMER</h3>
          </EuiTitle>
          <EuiText>
            <p>
              THE SITE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SITE AND OUR
              SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES,
              EXPRESS OR IMPLIED, IN CONNECTION WITH THE SITE AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE
              IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO
              WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SITE’S CONTENT OR THE CONTENT OF
              ANY WEBSITES LINKED TO THE SITE AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS,
              MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE
              WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SITE, (3) ANY UNAUTHORIZED ACCESS TO OR USE OF
              OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN,
              (4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SITE, (5) ANY BUGS, VIRUSES, TROJAN
              HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE SITE BY ANY THIRD PARTY, AND/OR (6) ANY
              ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A
              RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SITE. WE DO NOT
              WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR SERVICE ADVERTISED OR OFFERED BY
              A THIRD PARTY THROUGH THE SITE, ANY HYPERLINKED WEBSITE, OR ANY WEBSITE OR MOBILE APPLICATION FEATURED IN
              ANY BANNER OR OTHER ADVERTISING, AND WE WILL NOT BE A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING
              ANY TRANSACTION BETWEEN YOU AND ANY THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES. AS WITH THE PURCHASE OF
              A PRODUCT OR SERVICE THROUGH ANY MEDIUM OR IN ANY ENVIRONMENT, YOU SHOULD USE YOUR BEST JUDGMENT AND
              EXERCISE CAUTION WHERE APPROPRIATE.
            </p>
          </EuiText>
          <EuiSpacer />
          <EuiTitle size={'xs'}>
            <h3>LIMITATIONS OF LIABILITY</h3>
          </EuiTitle>
          <EuiText>
            <p>
              IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY
              DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST
              PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SITE, EVEN IF WE HAVE
              BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
          </EuiText>
          <EuiSpacer />
          <EuiTitle size={'xs'}>
            <h3>INDEMNIFICATION</h3>
          </EuiTitle>
          <EuiText>
            <p>
              You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of
              our respective officers, agents, partners, and employees, from and against any loss, damage, liability,
              claim, or demand, including reasonable attorneys’ fees and expenses, made by any third party due to or
              arising out of: (1) use of the Site; (2) breach of these Terms of Use; (3) any breach of your
              representations and warranties set forth in these Terms of Use; (4) your violation of the rights of a
              third party, including but not limited to intellectual property rights; or (5) any overt harmful act
              toward any other user of the Site with whom you connected via the Site. Notwithstanding the foregoing, we
              reserve the right, at your expense, to assume the exclusive defense and control of any matter for which
              you are required to indemnify us, and you agree to cooperate, at your expense, with our defense of such
              claims. We will use reasonable efforts to notify you of any such claim, action, or proceeding which is
              subject to this indemnification upon becoming aware of it.
            </p>
          </EuiText>
          <EuiSpacer />
          <EuiTitle size={'xs'}>
            <h3>ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</h3>
          </EuiTitle>
          <EuiText>
            <p>
              Visiting the Site, sending us emails, and completing online forms constitute electronic communications.
              You consent to receive electronic communications, and you agree that all agreements, notices, disclosures,
              and other communications we provide to you electronically, via email and on the Site, satisfy any legal
              requirement that such communication be in writing. YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES,
              CONTRACTS, ORDERS, AND OTHER RECORDS, AND TO ELECTRONIC DELIVERY OF NOTICES, POLICIES, AND RECORDS OF
              TRANSACTIONS INITIATED OR COMPLETED BY US OR VIA THE SITE. You hereby waive any rights or requirements
              under any statutes, regulations, rules, ordinances, or other laws in any jurisdiction which require an
              original signature or delivery or retention of non-electronic records, or to payments or the granting of
              credits by any means other than electronic means.
            </p>
          </EuiText>
          <EuiSpacer />
          <EuiTitle size={'xs'}>
            <h3>MISCELLANEOUS</h3>
          </EuiTitle>
          <EuiText>
            <p>
              These Terms of Use and any policies or operating rules posted by us on the Site or in respect to the Site
              constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce
              any right or provision of these Terms of Use shall not operate as a waiver of such right or provision.
              These Terms of Use operate to the fullest extent permissible by law. We may assign any or all of our
              rights and obligations to others at any time. We shall not be responsible or liable for any loss, damage,
              delay, or failure to act caused by any cause beyond our reasonable control. If any provision or part of a
              provision of these Terms of Use is determined to be unlawful, void, or unenforceable, that provision or
              part of the provision is deemed severable from these Terms of Use and does not affect the validity and
              enforceability of any remaining provisions. There is no joint venture, partnership, employment or agency
              relationship created between you and us as a result of these Terms of Use or use of the Site. You agree
              that these Terms of Use will not be construed against us by virtue of having drafted them. You hereby
              waive any and all defenses you may have based on the electronic form of these Terms of Use and the lack of
              signing by the parties hereto to execute these Terms of Use.
            </p>
          </EuiText>
          <EuiSpacer />
          <EuiTitle size={'xs'}>
            <h3>CONTACT US</h3>
          </EuiTitle>
          <EuiText>
            <p>
              In order to resolve a complaint regarding the Site or to receive further information regarding use of the
              Site, please contact us via email at{' '}
              <EuiLink href={'mailto:contact@secutils.dev'}>contact@secutils.dev</EuiLink>.
            </p>
          </EuiText>
          <EuiSpacer />
          <EuiText>
            <strong>Last updated:</strong> August 30 2022
          </EuiText>
        </EuiPageSection>
      </EuiPageBody>
    </EuiPage>
  );
}
