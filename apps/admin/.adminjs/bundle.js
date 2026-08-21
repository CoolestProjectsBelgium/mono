(function (React, designSystem, adminjs, styledComponents) {
  'use strict';

  function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

  var React__default = /*#__PURE__*/_interopDefault(React);

  // src/frontend/login.tsx
  const Login = () => {
    const [events, setEvents] = React.useState([]);
    const [selectedEvent, setEvent] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
      const fetchEvents = async () => {
        try {
          const response = await fetch('/api/events');
          const data = await response.json();
          setEvents(data);
          // Pre-select current event if available
          const currentEvent = data.find(e => e.isCurrent);
          setEvent(currentEvent || data[0]);
        } catch (error) {
          console.error('Failed to fetch events:', error);
          setEvents([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchEvents();
    }, []);
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      margin: "auto",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      method: "POST",
      as: "form"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H1, null, "Login"), /*#__PURE__*/React__default.default.createElement("section", {
      style: {
        width: "400px"
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, {
      action: "login"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      htmlFor: "email"
    }, "Account"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      name: "email",
      type: "text",
      variant: "default"
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      htmlFor: "password"
    }, "Password"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      name: "password",
      type: "password",
      variant: "default"
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      htmlFor: "event"
    }, "Event"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      type: "hidden",
      name: "event",
      value: selectedEvent?.value
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Select, {
      variant: "default",
      options: events,
      value: selectedEvent,
      onChange: setEvent,
      isLoading: isLoading,
      isDisabled: isLoading || events.length === 0
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      variant: "primary",
      type: "submit"
    }, "Login")));
  };

  const api$1 = new adminjs.ApiClient();

  // Interface voor de individuele media-items uit de backend workspace

  // Styled component voor de container-kaarten
  const Card$1 = styledComponents.styled(designSystem.Box)`
  color: ${({
  theme
}) => theme.colors.grey100};
  height: 100%;
  border: 1px solid transparent;
  border-radius: ${({
  theme
}) => theme.space.md};
  background: white;
`;
  //Card.defaultProps = { variant: 'container', boxShadow: 'card' }

  const MediaManagement = () => {
    const [media, setMedia] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // Functie om de mediabestanden dynamisch op te halen van de custom AdminJS pagina
    const loadMedia = () => {
      setLoading(true);
      api$1.getPage({
        pageName: 'Mediabewerkingen'
      }).then(response => {
        const data = response.data;
        setMedia(data.media || []);
        setLoading(false);
      }).catch(error => {
        console.error('Fout bij het ophalen van de media:', error);
        setLoading(false);
      });
    };

    // Laad de data direct in zodra de pagina geopend wordt
    React.useEffect(() => {
      loadMedia();
    }, []);
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      p: "xl"
    }, /*#__PURE__*/React__default.default.createElement(Card$1, null, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      p: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, {
      marginBottom: "lg"
    }, "Project Media & Selectie (Max. 1 per project confirmed)"), loading ? /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, "Bestanden worden ingeladen uit de container workspace...") : media.length > 0 ? /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: "20px"
    }, media.map(file => {
      const isVideo = file.mimetype.startsWith('video/');

      // Functie die wordt getriggerd wanneer je een radio-button indrukt
      const handleConfirmToggle = async () => {
        try {
          // Stuur een POST-request naar de handler in index.ts
          await api$1.getPage({
            pageName: 'Mediabewerkingen',
            method: 'post',
            data: {
              action: 'toggle-confirm',
              attachmentId: file.id
            }
          });
          // Herlaad de media direct om de groene randen en status te updaten
          loadMedia();
        } catch (error) {
          console.error('Fout bij het updaten van de confirmed status:', error);
        }
      };
      return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
        key: file.id,
        width: ['1', '1/2', '1/3', '240px'],
        style: {
          border: file.confirmed ? '2px solid #10b981' : '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
          backgroundColor: file.confirmed ? '#f0fdf4' : 'transparent',
          transition: 'all 0.2s ease-in-out'
        }
      }, /*#__PURE__*/React__default.default.createElement("a", {
        href: file.base64,
        target: "_blank",
        rel: "noopener noreferrer",
        style: {
          textDecoration: 'none',
          display: 'block'
        }
      }, isVideo ? /*#__PURE__*/React__default.default.createElement("video", {
        src: file.base64,
        style: {
          width: '100%',
          height: '130px',
          objectFit: 'cover',
          borderRadius: '6px'
        },
        muted: true
      }) : /*#__PURE__*/React__default.default.createElement("img", {
        src: file.base64,
        alt: file.name,
        style: {
          width: '100%',
          height: '130px',
          objectFit: 'cover',
          borderRadius: '6px'
        }
      })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
        marginTop: "md",
        flex: true,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px"
      }, /*#__PURE__*/React__default.default.createElement("input", {
        type: "radio",
        id: `confirm-${file.id}`
        // Groepeer op projectId zodat je per project één selectie kunt maken
        ,
        name: `project-selection-${file.projectId || 'global'}`,
        checked: file.confirmed,
        onChange: handleConfirmToggle,
        style: {
          transform: 'scale(1.3)',
          cursor: 'pointer'
        }
      }), /*#__PURE__*/React__default.default.createElement("label", {
        htmlFor: `confirm-${file.id}`,
        style: {
          fontSize: '14px',
          fontWeight: file.confirmed ? 'bold' : 'normal',
          color: file.confirmed ? '#059669' : '#4b5563',
          cursor: 'pointer'
        }
      }, file.confirmed ? '✓ Confirmed' : 'Selecteer')));
    })) : /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey80"
    }, "Er zijn momenteel geen media bestanden in de workspace map gevonden voor dit event."))));
  };

  const api = new adminjs.ApiClient();

  // 1. Unieke interface voor tabelitems (vragen & t-shirts)

  // 2. Hoofdinterface voor alle dashboardgegevens

  // Props interface voor de gestylede Card component

  const pageHeaderHeight = 300;
  const pageHeaderPaddingY = 54;
  const pageHeaderPaddingX = 300;
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  const DashboardHeader = () => {
    const [data, setData] = React.useState({});
    React.useEffect(() => {
      let isSubscribed = true;
      api.getDashboard().then(response => {
        console.log('dashboard.tsx_01', response);
        if (isSubscribed) {
          setData(response.data);
        }
      });
      return () => {
        isSubscribed = false;
      };
    }, []);
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      position: "relative",
      overflow: "hidden"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "grey100",
      height: pageHeaderHeight,
      py: pageHeaderPaddingY,
      px: ['default', 'lg', pageHeaderPaddingX]
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      textAlign: "center",
      color: "white"
    }, /*#__PURE__*/React__default.default.createElement("h2", {
      style: {
        fontSize: '32px',
        fontWeight: 'bold',
        margin: '10px 0'
      }
    }, data.event_title), /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, "starting on : ", ' ', data.officialStartDate !== undefined ? new Intl.DateTimeFormat('en-BE', options).format(new Date(data.officialStartDate)) : 'No event'), /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, data.days_remaining, " days remaining"))));
  };

  // Volledig getypeerde Styled Component
  const Card = styledComponents.styled(designSystem.Box)`
  display: ${({
  flex
}) => flex ? 'flex' : 'block'};
  color: ${({
  theme
}) => theme.colors.grey100};
  height: 100%;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: ${({
  theme
}) => theme.space.md};
  transition: all 0.1s ease-in;

  &:hover {
    border: 1px solid ${({
  theme
}) => theme.colors.primary60};
    box-shadow: ${({
  theme
}) => theme.shadows.cardHover};
  }

  & .dsc-icon svg, .gh-icon svg {
    width: 64px;
    height: 64px;
  }
`;
  Card.defaultProps = {
    variant: 'container',
    boxShadow: 'card'
  };
  const Dashboard = () => {
    const [data, setData] = React.useState({});
    React.useEffect(() => {
      let isSubscribed = true;
      api.getDashboard().then(response => {
        if (isSubscribed) {
          setData(response.data);
        }
      });
      return () => {
        isSubscribed = false;
      };
    }, []);
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, null, /*#__PURE__*/React__default.default.createElement(DashboardHeader, null), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mt: ['xl', 'xl', '-100px'],
      mb: "xl",
      mx: [0, 0, 0, 'auto'],
      px: ['default', 'lg', 'xxl', '0'],
      position: "relative",
      flex: true,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignContent: "flex-start",
      width: [1, 1, 1, 1024]
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1 / 2],
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(Card, {
      as: "a",
      flex: true
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      ml: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, null, "Status Registrations"), /*#__PURE__*/React__default.default.createElement("ul", null, /*#__PURE__*/React__default.default.createElement("li", null, data.pending_users ?? 0, " Registrations Pending"), /*#__PURE__*/React__default.default.createElement("li", null, data.overdue_registration ?? 0, " Overdue registrations"), /*#__PURE__*/React__default.default.createElement("li", null, data.waiting_list ?? 0, " On waiting list"), /*#__PURE__*/React__default.default.createElement("li", null, data.total_unusedVouchers ?? 0, " unused vouchers"))))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1 / 2],
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(Card, {
      as: "a",
      flex: true
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      ml: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, null, "Status Projects"), /*#__PURE__*/React__default.default.createElement("ul", null, /*#__PURE__*/React__default.default.createElement("li", null, data.total_projects ?? 0, "/", data.maxRegistration ?? 0, " Projects Remaining / with", ' ', data.total_usedVouchers ?? 0, " Co-Worker(s)"), /*#__PURE__*/React__default.default.createElement("li", null, (data.total_users || 0) - (data.total_usedVouchers || 0) - (data.total_projects || 0), " user(s) without Project"), /*#__PURE__*/React__default.default.createElement("li", null, data.total_videos ?? 0, " Project(s) with foto/video confirmed"))))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1 / 2],
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(Card, {
      as: "a",
      flex: true
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      ml: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, null, "Statistics Users (total:", data.total_users ?? 0, ")"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flex: true,
      flexDirection: "row",
      justifyContent: "space-between",
      position: "relative"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1 / 2]
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H5, null, "Languages"), /*#__PURE__*/React__default.default.createElement("ul", null, /*#__PURE__*/React__default.default.createElement("li", null, data.tlang_nl || 0, " nl"), /*#__PURE__*/React__default.default.createElement("li", null, data.tlang_fr || 0, " fr"), /*#__PURE__*/React__default.default.createElement("li", null, data.tlang_en || 0, " en"))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1 / 2]
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H5, null, "Sex"), /*#__PURE__*/React__default.default.createElement("ul", null, /*#__PURE__*/React__default.default.createElement("li", null, data.total_females || 0, " females"), /*#__PURE__*/React__default.default.createElement("li", null, data.total_males || 0, " males"), /*#__PURE__*/React__default.default.createElement("li", null, data.total_X || 0, " X"))))))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1],
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(Card, {
      as: "a",
      flex: true
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      ml: "xl",
      width: "100%"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, null, "Answers controle list"), /*#__PURE__*/React__default.default.createElement(designSystem.Table, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableHead, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "total"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "short"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "description"))), /*#__PURE__*/React__default.default.createElement(designSystem.TableBody, null, data.questions && data.questions.map(question => /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, {
      key: question.id
    }, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, question.total), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, question.short), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, question.description)))))))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      width: [1, 1, 1],
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(Card, {
      as: "a",
      flex: true
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      ml: "xl",
      width: "100%"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H4, null, "T-Shirts order list"), /*#__PURE__*/React__default.default.createElement(designSystem.Table, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableHead, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, null, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "total"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "short"), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, "description"))), /*#__PURE__*/React__default.default.createElement(designSystem.TableBody, null, data.tshirts && data.tshirts.map(tshirt => /*#__PURE__*/React__default.default.createElement(designSystem.TableRow, {
      key: tshirt.id
    }, /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, tshirt.total), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, tshirt.short), /*#__PURE__*/React__default.default.createElement(designSystem.TableCell, null, tshirt.description))))))))));
  };

  const PasswordEdit = props => {
    const {
      onChange,
      property,
      record,
      resource
    } = props;
    const {
      translateButton: tb
    } = adminjs.useTranslation();
    const [showPassword, togglePassword] = React.useState(false);
    React.useEffect(() => {
      if (!showPassword) {
        onChange(property.name, '');
      }
    }, [onChange, showPassword]);
    // For new records always show the property
    if (!record.id) {
      return /*#__PURE__*/React__default.default.createElement(adminjs.BasePropertyComponent.Password.Edit, props);
    }
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, null, showPassword && /*#__PURE__*/React__default.default.createElement(adminjs.BasePropertyComponent.Password.Edit, props), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mb: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      textAlign: "center"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      onClick: () => togglePassword(!showPassword),
      type: "button"
    }, showPassword ? tb('cancel', resource.id) : tb('changePassword', resource.id)))));
  };

  AdminJS.UserComponents = {};
  AdminJS.UserComponents.Login = Login;
  AdminJS.UserComponents.MediaManagement = MediaManagement;
  AdminJS.UserComponents.Dashboard = Dashboard;
  AdminJS.UserComponents.PasswordEditComponent = PasswordEdit;

})(React, AdminJSDesignSystem, AdminJS, styled);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvY29tcG9uZW50cy9Mb2dpbi50c3giLCIuLi9zcmMvY29tcG9uZW50cy9NZWRpYU1hbmFnZW1lbnQudHN4IiwiLi4vc3JjL2NvbXBvbmVudHMvRGFzaGJvYXJkLnRzeCIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9AYWRtaW5qcy9wYXNzd29yZHMvYnVpbGQvY29tcG9uZW50cy9QYXNzd29yZEVkaXRDb21wb25lbnQuanN4IiwiZW50cnkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gc3JjL2Zyb250ZW5kL2xvZ2luLnRzeFxuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQge1xuICBCb3gsXG4gIEJ1dHRvbixcbiAgSW5wdXQsXG4gIExhYmVsLFxuICBIMSxcbiAgU2VsZWN0LFxuICBGb3JtR3JvdXAsXG59IGZyb20gXCJAYWRtaW5qcy9kZXNpZ24tc3lzdGVtXCI7XG5cbmNvbnN0IExvZ2luID0gKCkgPT4ge1xuICBjb25zdCBbZXZlbnRzLCBzZXRFdmVudHNdID0gdXNlU3RhdGU8YW55W10+KFtdKTtcbiAgY29uc3QgW3NlbGVjdGVkRXZlbnQsIHNldEV2ZW50XSA9IHVzZVN0YXRlPGFueT4obnVsbCk7XG4gIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGZldGNoRXZlbnRzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnL2FwaS9ldmVudHMnKTtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgc2V0RXZlbnRzKGRhdGEpO1xuICAgICAgICAvLyBQcmUtc2VsZWN0IGN1cnJlbnQgZXZlbnQgaWYgYXZhaWxhYmxlXG4gICAgICAgIGNvbnN0IGN1cnJlbnRFdmVudCA9IGRhdGEuZmluZCgoZTogYW55KSA9PiBlLmlzQ3VycmVudCk7XG4gICAgICAgIHNldEV2ZW50KGN1cnJlbnRFdmVudCB8fCBkYXRhWzBdKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBmZXRjaCBldmVudHM6JywgZXJyb3IpO1xuICAgICAgICBzZXRFdmVudHMoW10pO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGZldGNoRXZlbnRzKCk7XG4gIH0sIFtdKTtcblxuICByZXR1cm4gKFxuICAgIDxCb3hcbiAgICAgIG1hcmdpbj1cImF1dG9cIlxuICAgICAgaGVpZ2h0PVwiMTAwdmhcIlxuICAgICAgZGlzcGxheT1cImZsZXhcIlxuICAgICAgZmxleERpcmVjdGlvbj1cImNvbHVtblwiXG4gICAgICBhbGlnbkl0ZW1zPVwiY2VudGVyXCJcbiAgICAgIGp1c3RpZnlDb250ZW50PVwiY2VudGVyXCJcbiAgICAgIG1ldGhvZD1cIlBPU1RcIiBhcz1cImZvcm1cIlxuICAgID5cbiAgICAgIDxIMT5Mb2dpbjwvSDE+XG4gICAgICA8c2VjdGlvbiBzdHlsZT17eyB3aWR0aDogXCI0MDBweFwiIH19PlxuICAgICAgICA8Rm9ybUdyb3VwIGFjdGlvbj1cImxvZ2luXCIgPlxuICAgICAgICAgIDxMYWJlbCBodG1sRm9yPVwiZW1haWxcIj5BY2NvdW50PC9MYWJlbD5cbiAgICAgICAgICA8SW5wdXQgbmFtZT1cImVtYWlsXCIgdHlwZT1cInRleHRcIiB2YXJpYW50PVwiZGVmYXVsdFwiIC8+XG4gICAgICAgICAgPExhYmVsIGh0bWxGb3I9XCJwYXNzd29yZFwiPlBhc3N3b3JkPC9MYWJlbD5cbiAgICAgICAgICA8SW5wdXQgbmFtZT1cInBhc3N3b3JkXCIgdHlwZT1cInBhc3N3b3JkXCIgdmFyaWFudD1cImRlZmF1bHRcIiAvPlxuICAgICAgICAgIDxMYWJlbCBodG1sRm9yPVwiZXZlbnRcIj5FdmVudDwvTGFiZWw+XG4gICAgICAgICAgPElucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiZXZlbnRcIiB2YWx1ZT17c2VsZWN0ZWRFdmVudD8udmFsdWV9IC8+XG4gICAgICAgICAgPFNlbGVjdCBcbiAgICAgICAgICAgIHZhcmlhbnQ9XCJkZWZhdWx0XCIgXG4gICAgICAgICAgICBvcHRpb25zPXtldmVudHN9IFxuICAgICAgICAgICAgdmFsdWU9e3NlbGVjdGVkRXZlbnR9IFxuICAgICAgICAgICAgb25DaGFuZ2U9e3NldEV2ZW50fVxuICAgICAgICAgICAgaXNMb2FkaW5nPXtpc0xvYWRpbmd9XG4gICAgICAgICAgICBpc0Rpc2FibGVkPXtpc0xvYWRpbmcgfHwgZXZlbnRzLmxlbmd0aCA9PT0gMH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L0Zvcm1Hcm91cD5cbiAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwicHJpbWFyeVwiIHR5cGU9XCJzdWJtaXRcIj5Mb2dpbjwvQnV0dG9uPlxuICAgICAgPC9zZWN0aW9uPlxuICAgIDwvQm94PlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgTG9naW47XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQXBpQ2xpZW50IH0gZnJvbSAnYWRtaW5qcydcbmltcG9ydCB7IEJveCwgSDQsIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJ1xuaW1wb3J0IHsgc3R5bGVkIH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbS9zdHlsZWQtY29tcG9uZW50cydcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpXG5cbi8vIEludGVyZmFjZSB2b29yIGRlIGluZGl2aWR1ZWxlIG1lZGlhLWl0ZW1zIHVpdCBkZSBiYWNrZW5kIHdvcmtzcGFjZVxuaW50ZXJmYWNlIE1lZGlhSXRlbSB7XG4gICAgaWQ6IG51bWJlclxuICAgIHByb2plY3RJZD86IG51bWJlclxuICAgIG1pbWV0eXBlOiBzdHJpbmdcbiAgICBuYW1lOiBzdHJpbmdcbiAgICBiYXNlNjQ6IHN0cmluZ1xuICAgIGNvbmZpcm1lZDogYm9vbGVhblxufVxuXG4vLyBTdHlsZWQgY29tcG9uZW50IHZvb3IgZGUgY29udGFpbmVyLWthYXJ0ZW5cbmNvbnN0IENhcmQgPSBzdHlsZWQoQm94KWBcbiAgY29sb3I6ICR7KHsgdGhlbWUgfSkgPT4gdGhlbWUuY29sb3JzLmdyZXkxMDB9O1xuICBoZWlnaHQ6IDEwMCU7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICBib3JkZXItcmFkaXVzOiAkeyh7IHRoZW1lIH0pID0+IHRoZW1lLnNwYWNlLm1kfTtcbiAgYmFja2dyb3VuZDogd2hpdGU7XG5gXG4vL0NhcmQuZGVmYXVsdFByb3BzID0geyB2YXJpYW50OiAnY29udGFpbmVyJywgYm94U2hhZG93OiAnY2FyZCcgfVxuXG5leHBvcnQgY29uc3QgTWVkaWFNYW5hZ2VtZW50OiBSZWFjdC5GQyA9ICgpID0+IHtcbiAgICBjb25zdCBbbWVkaWEsIHNldE1lZGlhXSA9IHVzZVN0YXRlPE1lZGlhSXRlbVtdPihbXSlcbiAgICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZTxib29sZWFuPih0cnVlKVxuXG4gICAgLy8gRnVuY3RpZSBvbSBkZSBtZWRpYWJlc3RhbmRlbiBkeW5hbWlzY2ggb3AgdGUgaGFsZW4gdmFuIGRlIGN1c3RvbSBBZG1pbkpTIHBhZ2luYVxuICAgIGNvbnN0IGxvYWRNZWRpYSA9ICgpID0+IHtcbiAgICAgICAgc2V0TG9hZGluZyh0cnVlKVxuICAgICAgICBhcGkuZ2V0UGFnZSh7IHBhZ2VOYW1lOiAnTWVkaWFiZXdlcmtpbmdlbicgfSlcbiAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSByZXNwb25zZS5kYXRhIGFzIHsgbWVkaWE/OiBNZWRpYUl0ZW1bXSB9XG4gICAgICAgICAgICAgICAgc2V0TWVkaWEoZGF0YS5tZWRpYSB8fCBbXSlcbiAgICAgICAgICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGb3V0IGJpaiBoZXQgb3BoYWxlbiB2YW4gZGUgbWVkaWE6JywgZXJyb3IpXG4gICAgICAgICAgICAgICAgc2V0TG9hZGluZyhmYWxzZSlcbiAgICAgICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gTGFhZCBkZSBkYXRhIGRpcmVjdCBpbiB6b2RyYSBkZSBwYWdpbmEgZ2VvcGVuZCB3b3JkdFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxvYWRNZWRpYSgpXG4gICAgfSwgW10pXG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8Qm94IHA9XCJ4bFwiPlxuICAgICAgICAgICAgPENhcmQ+XG4gICAgICAgICAgICAgICAgPEJveCBwPVwieGxcIj5cbiAgICAgICAgICAgICAgICAgICAgPEg0IG1hcmdpbkJvdHRvbT1cImxnXCI+UHJvamVjdCBNZWRpYSAmIFNlbGVjdGllIChNYXguIDEgcGVyIHByb2plY3QgY29uZmlybWVkKTwvSDQ+XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB7bG9hZGluZyA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxUZXh0IGNvbG9yPVwiZ3JleTYwXCI+QmVzdGFuZGVuIHdvcmRlbiBpbmdlbGFkZW4gdWl0IGRlIGNvbnRhaW5lciB3b3Jrc3BhY2UuLi48L1RleHQ+XG4gICAgICAgICAgICAgICAgICAgICkgOiBtZWRpYS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPEJveCBmbGV4IGZsZXhEaXJlY3Rpb249XCJyb3dcIiBmbGV4V3JhcD1cIndyYXBcIiBnYXA9XCIyMHB4XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge21lZGlhLm1hcCgoZmlsZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpc1ZpZGVvID0gZmlsZS5taW1ldHlwZS5zdGFydHNXaXRoKCd2aWRlby8nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRnVuY3RpZSBkaWUgd29yZHQgZ2V0cmlnZ2VyZCB3YW5uZWVyIGplIGVlbiByYWRpby1idXR0b24gaW5kcnVrdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBoYW5kbGVDb25maXJtVG9nZ2xlID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTdHV1ciBlZW4gUE9TVC1yZXF1ZXN0IG5hYXIgZGUgaGFuZGxlciBpbiBpbmRleC50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGFwaS5nZXRQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZU5hbWU6ICdNZWRpYWJld2Vya2luZ2VuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3RvZ2dsZS1jb25maXJtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dGFjaG1lbnRJZDogZmlsZS5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIZXJsYWFkIGRlIG1lZGlhIGRpcmVjdCBvbSBkZSBncm9lbmUgcmFuZGVuIGVuIHN0YXR1cyB0ZSB1cGRhdGVuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZE1lZGlhKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRm91dCBiaWogaGV0IHVwZGF0ZW4gdmFuIGRlIGNvbmZpcm1lZCBzdGF0dXM6JywgZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJveCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9e2ZpbGUuaWR9IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPXtbJzEnLCAnMS8yJywgJzEvMycsICcyNDBweCddfSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiBmaWxlLmNvbmZpcm1lZCA/ICcycHggc29saWQgIzEwYjk4MScgOiAnMXB4IHNvbGlkICNlMmU4ZjAnLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnOHB4JywgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4JywgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogZmlsZS5jb25maXJtZWQgPyAnI2YwZmRmNCcgOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnYWxsIDAuMnMgZWFzZS1pbi1vdXQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7LyogS2xpa2JhcmUgdGh1bWJuYWlsIGRpZSBkZSBCYXNlNjQgZGF0YSBvcGVudCBpbiBlZW4gbmlldXcgdGFiYmxhZCAqL31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPXtmaWxlLmJhc2U2NH0gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiIHN0eWxlPXt7IHRleHREZWNvcmF0aW9uOiAnbm9uZScsIGRpc3BsYXk6ICdibG9jaycgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtpc1ZpZGVvID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZpZGVvIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYz17ZmlsZS5iYXNlNjR9IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGhlaWdodDogJzEzMHB4Jywgb2JqZWN0Rml0OiAnY292ZXInLCBib3JkZXJSYWRpdXM6ICc2cHgnIH19IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG11dGVkIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjPXtmaWxlLmJhc2U2NH0gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0PXtmaWxlLm5hbWV9IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGhlaWdodDogJzEzMHB4Jywgb2JqZWN0Rml0OiAnY292ZXInLCBib3JkZXJSYWRpdXM6ICc2cHgnIH19IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2E+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7LyogUmFkaW8tYnV0dG9uIHNlbGVjdGllIHBlciBwcm9qZWN0Z3JvZXAgKi99XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJveCBtYXJnaW5Ub3A9XCJtZFwiIGZsZXggZmxleERpcmVjdGlvbj1cInJvd1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cImNlbnRlclwiIGdhcD1cIjhweFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwicmFkaW9cIiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkPXtgY29uZmlybS0ke2ZpbGUuaWR9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdyb2VwZWVyIG9wIHByb2plY3RJZCB6b2RhdCBqZSBwZXIgcHJvamVjdCDDqcOpbiBzZWxlY3RpZSBrdW50IG1ha2VuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lPXtgcHJvamVjdC1zZWxlY3Rpb24tJHtmaWxlLnByb2plY3RJZCB8fCAnZ2xvYmFsJ31gfSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e2ZpbGUuY29uZmlybWVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZUNvbmZpcm1Ub2dnbGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyB0cmFuc2Zvcm06ICdzY2FsZSgxLjMpJywgY3Vyc29yOiAncG9pbnRlcicgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbEZvcj17YGNvbmZpcm0tJHtmaWxlLmlkfWB9IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNHB4JywgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogZmlsZS5jb25maXJtZWQgPyAnYm9sZCcgOiAnbm9ybWFsJywgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IGZpbGUuY29uZmlybWVkID8gJyMwNTk2NjknIDogJyM0YjU1NjMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZmlsZS5jb25maXJtZWQgPyAn4pyTIENvbmZpcm1lZCcgOiAnU2VsZWN0ZWVyJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxUZXh0IGNvbG9yPVwiZ3JleTgwXCI+RXIgemlqbiBtb21lbnRlZWwgZ2VlbiBtZWRpYSBiZXN0YW5kZW4gaW4gZGUgd29ya3NwYWNlIG1hcCBnZXZvbmRlbiB2b29yIGRpdCBldmVudC48L1RleHQ+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgIDwvQm94PlxuICAgIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVkaWFNYW5hZ2VtZW50XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQXBpQ2xpZW50IH0gZnJvbSAnYWRtaW5qcydcbmludGVyZmFjZSBNZWRpYUl0ZW0ge1xuICAgIGlkOiBudW1iZXJcbiAgICBtaW1ldHlwZTogc3RyaW5nXG4gICAgbmFtZTogc3RyaW5nXG4gICAgYmFzZTY0OiBzdHJpbmdcbiAgICBjb25maXJtZWQ6IGJvb2xlYW5cbiAgICBwcm9qZWN0SWQ/OiBudW1iZXIgLy8gPC0tIFZvZWcgZGV6ZSByZWdlbCB0b2Vcbn1cblxuXG5pbXBvcnQgeyBcbiAgICBCb3gsIFxuICAgIEg0LFxuICAgIEg1LFxuICAgIFRhYmxlLFxuICAgIFRhYmxlUm93LFxuICAgIFRhYmxlQm9keSxcbiAgICBUYWJsZUNlbGwsXG4gICAgVGFibGVIZWFkLFxuICAgIFRleHQgXG59IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nXG5pbXBvcnQgeyBzdHlsZWQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtL3N0eWxlZC1jb21wb25lbnRzJ1xuXG5jb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KClcblxuLy8gMS4gVW5pZWtlIGludGVyZmFjZSB2b29yIHRhYmVsaXRlbXMgKHZyYWdlbiAmIHQtc2hpcnRzKVxuaW50ZXJmYWNlIFRhYmxlSXRlbSB7XG4gICAgaWQ6IHN0cmluZyB8IG51bWJlclxuICAgIHRvdGFsOiBudW1iZXIgfCBzdHJpbmdcbiAgICBzaG9ydDogc3RyaW5nXG4gICAgZGVzY3JpcHRpb246IHN0cmluZ1xufVxuXG5pbnRlcmZhY2UgRGFzaGJvYXJkRGF0YSB7XG4gICAgICAgIG1lZGlhPzogTWVkaWFJdGVtW10gLy8gPC0tIERJVCBMT1NUIERFIFRTKDIzMzkpIEZPVVQgT1AhXG59XG4vLyAyLiBIb29mZGludGVyZmFjZSB2b29yIGFsbGUgZGFzaGJvYXJkZ2VnZXZlbnNcbmludGVyZmFjZSBEYXNoYm9hcmREYXRhIHtcbiAgICBldmVudF90aXRsZT86IHN0cmluZ1xuICAgIG9mZmljaWFsU3RhcnREYXRlPzogc3RyaW5nXG4gICAgZGF5c19yZW1haW5pbmc/OiBudW1iZXJcbiAgICBwZW5kaW5nX3VzZXJzPzogbnVtYmVyXG4gICAgb3ZlcmR1ZV9yZWdpc3RyYXRpb24/OiBudW1iZXJcbiAgICB3YWl0aW5nX2xpc3Q/OiBudW1iZXJcbiAgICB0b3RhbF91bnVzZWRWb3VjaGVycz86IG51bWJlclxuICAgIHRvdGFsX3Byb2plY3RzPzogbnVtYmVyXG4gICAgbWF4UmVnaXN0cmF0aW9uPzogbnVtYmVyXG4gICAgdG90YWxfdXNlZFZvdWNoZXJzPzogbnVtYmVyXG4gICAgdG90YWxfdXNlcnM/OiBudW1iZXJcbiAgICB0b3RhbF92aWRlb3M/OiBudW1iZXJcbiAgICB0bGFuZ19ubD86IG51bWJlclxuICAgIHRsYW5nX2ZyPzogbnVtYmVyXG4gICAgdGxhbmdfZW4/OiBudW1iZXJcbiAgICB0b3RhbF9mZW1hbGVzPzogbnVtYmVyXG4gICAgdG90YWxfbWFsZXM/OiBudW1iZXJcbiAgICB0b3RhbF9YPzogbnVtYmVyXG4gICAgcXVlc3Rpb25zPzogVGFibGVJdGVtW11cbiAgICB0c2hpcnRzPzogVGFibGVJdGVtW11cbiAgICBtZWRpYT86IE1lZGlhSXRlbVtdIC8vIDwtLSBESVQgTE9TVCBERSBUUygyMzM5KSBGT1VUIE9QIVxufVxuXG4vLyBQcm9wcyBpbnRlcmZhY2Ugdm9vciBkZSBnZXN0eWxlZGUgQ2FyZCBjb21wb25lbnRcbmludGVyZmFjZSBDYXJkUHJvcHMge1xuICAgIGZsZXg/OiBib29sZWFuXG59XG5cbmNvbnN0IHBhZ2VIZWFkZXJIZWlnaHQgPSAzMDBcbmNvbnN0IHBhZ2VIZWFkZXJQYWRkaW5nWSA9IDU0XG5jb25zdCBwYWdlSGVhZGVyUGFkZGluZ1ggPSAzMDBcblxuY29uc3Qgb3B0aW9uczogSW50bC5EYXRlVGltZUZvcm1hdE9wdGlvbnMgPSB7XG4gICAgeWVhcjogJ251bWVyaWMnLFxuICAgIG1vbnRoOiAnMi1kaWdpdCcsXG4gICAgZGF5OiAnMi1kaWdpdCdcbn1cblxuZXhwb3J0IGNvbnN0IERhc2hib2FyZEhlYWRlcjogUmVhY3QuRkMgPSAoKSA9PiB7XG4gICAgY29uc3QgW2RhdGEsIHNldERhdGFdID0gdXNlU3RhdGU8RGFzaGJvYXJkRGF0YT4oe30pXG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsZXQgaXNTdWJzY3JpYmVkID0gdHJ1ZVxuICAgICAgICBhcGkuZ2V0RGFzaGJvYXJkKCkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkYXNoYm9hcmQudHN4XzAxJywgcmVzcG9uc2UpXG4gICAgICAgICAgICBpZiAoaXNTdWJzY3JpYmVkKSB7XG4gICAgICAgICAgICAgICAgc2V0RGF0YShyZXNwb25zZS5kYXRhIGFzIERhc2hib2FyZERhdGEpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBpc1N1YnNjcmliZWQgPSBmYWxzZVxuICAgICAgICB9XG4gICAgfSwgW10pXG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8Qm94IHBvc2l0aW9uPVwicmVsYXRpdmVcIiBvdmVyZmxvdz1cImhpZGRlblwiPlxuICAgICAgICAgICAgPEJveFxuICAgICAgICAgICAgICAgIGJnPVwiZ3JleTEwMFwiXG4gICAgICAgICAgICAgICAgaGVpZ2h0PXtwYWdlSGVhZGVySGVpZ2h0fVxuICAgICAgICAgICAgICAgIHB5PXtwYWdlSGVhZGVyUGFkZGluZ1l9XG4gICAgICAgICAgICAgICAgcHg9e1snZGVmYXVsdCcsICdsZycsIHBhZ2VIZWFkZXJQYWRkaW5nWF19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPEJveCB0ZXh0QWxpZ249XCJjZW50ZXJcIiBjb2xvcj1cIndoaXRlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxoMiBzdHlsZT17eyBmb250U2l6ZTogJzMycHgnLCBmb250V2VpZ2h0OiAnYm9sZCcsIG1hcmdpbjogJzEwcHggMCcgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7ZGF0YS5ldmVudF90aXRsZX1cbiAgICAgICAgICAgICAgICAgICAgPC9oMj5cbiAgICAgICAgICAgICAgICAgICAgPFRleHQ+c3RhcnRpbmcgb24gOiB7JyAnfVxuICAgICAgICAgICAgICAgICAgICAgICAge2RhdGEub2ZmaWNpYWxTdGFydERhdGUgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoJ2VuLUJFJywgb3B0aW9ucykuZm9ybWF0KG5ldyBEYXRlKGRhdGEub2ZmaWNpYWxTdGFydERhdGUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ05vIGV2ZW50J31cbiAgICAgICAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICAgICAgICA8VGV4dD57ZGF0YS5kYXlzX3JlbWFpbmluZ30gZGF5cyByZW1haW5pbmc8L1RleHQ+XG4gICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgPC9Cb3g+XG4gICAgKVxufVxuXG4vLyBUeXBlIGRlZmluaXRpZSB2b29yIGRlIG5hdmlnYXRpZWJsb2trZW4gKGluZGllbiBqZSBkZXplIGxhdGVyIHdpbCByZW5kZXJlbilcbnR5cGUgQm94VHlwZSA9IHtcbiAgICB0aXRsZTogc3RyaW5nXG4gICAgc3VidGl0bGU6IHN0cmluZ1xuICAgIGhyZWY6IHN0cmluZ1xufVxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5jb25zdCBib3hlcyA9ICgpOiBBcnJheTxCb3hUeXBlPiA9PiBbXG4gICAge1xuICAgICAgICB0aXRsZTogXCJSZWdpc3RlclwiLFxuICAgICAgICBzdWJ0aXRsZTogXCJSZWdpc3RlciBvbiBiZWhhbGYgb2YgYSBwYXJ0aWNpcGFudFwiLFxuICAgICAgICBocmVmOiAnaHR0cHM6Ly9kb2NzLmFkbWluanMuY28vYmFzaWNzL3Jlc291cmNlI3Byb3ZpZGluZy1yZXNvdXJjZXMtZXhwbGljaXRseScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHRpdGxlOiBcIlVwbG9hZCBGb3RvXCIsXG4gICAgICAgIHN1YnRpdGxlOiBcIlVwbG9hZCBmb3RvcyBvbiBiZWhhbGYgb2YgYSBwYXJ0aWNpcGFudFwiLFxuICAgICAgICBocmVmOiAnaHR0cHM6Ly9kb2NzLmFkbWluanMuY28vYmFzaWNzL3Jlc291cmNlI3Byb3ZpZGluZy1yZXNvdXJjZXMtZXhwbGljaXRseScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHRpdGxlOiBcIlN0YXRpc3RpZWtOZXdcIixcbiAgICAgICAgc3VidGl0bGU6IFwiU2hvdyBzZXZlcmFsIHN0YXRpc3RpY3MgYWJvdXQgdGhlIGV2ZW50IE5ld1wiLFxuICAgICAgICBocmVmOiAnaHR0cHM6Ly9kb2NzLmFkbWluanMuY28vYmFzaWNzL3Jlc291cmNlI3Byb3ZpZGluZy1yZXNvdXJjZXMtZXhwbGljaXRseScsXG4gICAgfSxcbl1cblxuLy8gVm9sbGVkaWcgZ2V0eXBlZXJkZSBTdHlsZWQgQ29tcG9uZW50XG5jb25zdCBDYXJkID0gc3R5bGVkKEJveCk8Q2FyZFByb3BzPmBcbiAgZGlzcGxheTogJHsoeyBmbGV4IH0pOiBzdHJpbmcgPT4gKGZsZXggPyAnZmxleCcgOiAnYmxvY2snKX07XG4gIGNvbG9yOiAkeyh7IHRoZW1lIH0pID0+IHRoZW1lLmNvbG9ycy5ncmV5MTAwfTtcbiAgaGVpZ2h0OiAxMDAlO1xuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICBib3JkZXItcmFkaXVzOiAkeyh7IHRoZW1lIH0pID0+IHRoZW1lLnNwYWNlLm1kfTtcbiAgdHJhbnNpdGlvbjogYWxsIDAuMXMgZWFzZS1pbjtcblxuICAmOmhvdmVyIHtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAkeyh7IHRoZW1lIH0pID0+IHRoZW1lLmNvbG9ycy5wcmltYXJ5NjB9O1xuICAgIGJveC1zaGFkb3c6ICR7KHsgdGhlbWUgfSkgPT4gdGhlbWUuc2hhZG93cy5jYXJkSG92ZXJ9O1xuICB9XG5cbiAgJiAuZHNjLWljb24gc3ZnLCAuZ2gtaWNvbiBzdmcge1xuICAgIHdpZHRoOiA2NHB4O1xuICAgIGhlaWdodDogNjRweDtcbiAgfVxuYFxuXG5DYXJkLmRlZmF1bHRQcm9wcyA9IHtcbiAgICB2YXJpYW50OiAnY29udGFpbmVyJyxcbiAgICBib3hTaGFkb3c6ICdjYXJkJyxcbn1cblxuZXhwb3J0IGNvbnN0IERhc2hib2FyZDogUmVhY3QuRkMgPSAoKSA9PiB7XG4gICAgY29uc3QgW2RhdGEsIHNldERhdGFdID0gdXNlU3RhdGU8RGFzaGJvYXJkRGF0YT4oe30pXG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsZXQgaXNTdWJzY3JpYmVkID0gdHJ1ZVxuICAgICAgICBhcGkuZ2V0RGFzaGJvYXJkKCkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGlmIChpc1N1YnNjcmliZWQpIHtcbiAgICAgICAgICAgICAgICBzZXREYXRhKHJlc3BvbnNlLmRhdGEgYXMgRGFzaGJvYXJkRGF0YSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGlzU3Vic2NyaWJlZCA9IGZhbHNlXG4gICAgICAgIH1cbiAgICB9LCBbXSlcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxCb3g+XG4gICAgICAgICAgICA8RGFzaGJvYXJkSGVhZGVyIC8+XG4gICAgICAgICAgICA8Qm94XG4gICAgICAgICAgICAgICAgbXQ9e1sneGwnLCAneGwnLCAnLTEwMHB4J119XG4gICAgICAgICAgICAgICAgbWI9XCJ4bFwiXG4gICAgICAgICAgICAgICAgbXg9e1swLCAwLCAwLCAnYXV0byddfVxuICAgICAgICAgICAgICAgIHB4PXtbJ2RlZmF1bHQnLCAnbGcnLCAneHhsJywgJzAnXX1cbiAgICAgICAgICAgICAgICBwb3NpdGlvbj1cInJlbGF0aXZlXCJcbiAgICAgICAgICAgICAgICBmbGV4XG4gICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbj1cInJvd1wiXG4gICAgICAgICAgICAgICAgZmxleFdyYXA9XCJ3cmFwXCJcbiAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIlxuICAgICAgICAgICAgICAgIGFsaWduQ29udGVudD1cImZsZXgtc3RhcnRcIlxuICAgICAgICAgICAgICAgIHdpZHRoPXtbMSwgMSwgMSwgMTAyNF19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgey8qIDEuIFN0YXR1cyBSZWdpc3RyYXRpb25zICovfVxuICAgICAgICAgICAgICAgIDxCb3ggd2lkdGg9e1sxLCAxLCAxIC8gMl19IHA9XCJsZ1wiPlxuICAgICAgICAgICAgICAgICAgICA8Q2FyZCBhcz1cImFcIiBmbGV4PlxuICAgICAgICAgICAgICAgICAgICAgICAgPEJveCBtbD1cInhsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEg0PlN0YXR1cyBSZWdpc3RyYXRpb25zPC9IND5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT57ZGF0YS5wZW5kaW5nX3VzZXJzID8/IDB9IFJlZ2lzdHJhdGlvbnMgUGVuZGluZzwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT57ZGF0YS5vdmVyZHVlX3JlZ2lzdHJhdGlvbiA/PyAwfSBPdmVyZHVlIHJlZ2lzdHJhdGlvbnM8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEud2FpdGluZ19saXN0ID8/IDB9IE9uIHdhaXRpbmcgbGlzdDwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT57ZGF0YS50b3RhbF91bnVzZWRWb3VjaGVycyA/PyAwfSB1bnVzZWQgdm91Y2hlcnM8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICAgICAgIDwvQm94PlxuXG4gICAgICAgICAgICAgICAgey8qIDIuIFN0YXR1cyBQcm9qZWN0cyAqL31cbiAgICAgICAgICAgICAgICA8Qm94IHdpZHRoPXtbMSwgMSwgMSAvIDJdfSBwPVwibGdcIj5cbiAgICAgICAgICAgICAgICAgICAgPENhcmQgYXM9XCJhXCIgZmxleD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggbWw9XCJ4bFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxIND5TdGF0dXMgUHJvamVjdHM8L0g0PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2RhdGEudG90YWxfcHJvamVjdHMgPz8gMH0ve2RhdGEubWF4UmVnaXN0cmF0aW9uID8/IDB9IFByb2plY3RzIFJlbWFpbmluZyAvIHdpdGh7JyAnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2RhdGEudG90YWxfdXNlZFZvdWNoZXJzID8/IDB9IENvLVdvcmtlcihzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7KChkYXRhLnRvdGFsX3VzZXJzIHx8IDApIC0gKGRhdGEudG90YWxfdXNlZFZvdWNoZXJzIHx8IDApIC0gKGRhdGEudG90YWxfcHJvamVjdHMgfHwgMCkpfSB1c2VyKHMpIHdpdGhvdXQgUHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEudG90YWxfdmlkZW9zID8/IDB9IFByb2plY3Qocykgd2l0aCBmb3RvL3ZpZGVvIGNvbmZpcm1lZDwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgICAgICAgPC9Cb3g+XG5cbiAgICAgICAgICAgICAgICB7LyogMy4gU3RhdGlzdGljcyBVc2VycyAqL31cbiAgICAgICAgICAgICAgICA8Qm94IHdpZHRoPXtbMSwgMSwgMSAvIDJdfSBwPVwibGdcIj5cbiAgICAgICAgICAgICAgICAgICAgPENhcmQgYXM9XCJhXCIgZmxleD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggbWw9XCJ4bFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxIND5TdGF0aXN0aWNzIFVzZXJzICh0b3RhbDp7ZGF0YS50b3RhbF91c2VycyA/PyAwfSk8L0g0PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggZmxleCBmbGV4RGlyZWN0aW9uPVwicm93XCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCIgcG9zaXRpb249XCJyZWxhdGl2ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Qm94IHdpZHRoPXtbMSwgMSwgMSAvIDJdfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxINT5MYW5ndWFnZXM8L0g1PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaT57ZGF0YS50bGFuZ19ubCB8fCAwfSBubDwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPntkYXRhLnRsYW5nX2ZyIHx8IDB9IGZyPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEudGxhbmdfZW4gfHwgMH0gZW48L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggd2lkdGg9e1sxLCAxLCAxIC8gMl19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEg1PlNleDwvSDU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPntkYXRhLnRvdGFsX2ZlbWFsZXMgfHwgMH0gZmVtYWxlczwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPntkYXRhLnRvdGFsX21hbGVzIHx8IDB9IG1hbGVzPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGk+e2RhdGEudG90YWxfWCB8fCAwfSBYPC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICAgICAgICA8L0JveD5cblxuICAgICAgICAgICAgICAgIHsvKiA0LiBBbnN3ZXJzIFRhYmxlICovfVxuICAgICAgICAgICAgICAgIDxCb3ggd2lkdGg9e1sxLCAxLCAxXX0gcD1cImxnXCI+XG4gICAgICAgICAgICAgICAgICAgIDxDYXJkIGFzPVwiYVwiIGZsZXg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Qm94IG1sPVwieGxcIiB3aWR0aD1cIjEwMCVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8SDQ+QW5zd2VycyBjb250cm9sZSBsaXN0PC9IND5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUhlYWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVSb3c+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD50b3RhbDwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+c2hvcnQ8L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPmRlc2NyaXB0aW9uPC9UYWJsZUNlbGw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlUm93PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlSGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQm9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtkYXRhLnF1ZXN0aW9ucyAmJiBkYXRhLnF1ZXN0aW9ucy5tYXAoKHF1ZXN0aW9uKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlUm93IGtleT17cXVlc3Rpb24uaWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPntxdWVzdGlvbi50b3RhbH08L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD57cXVlc3Rpb24uc2hvcnR9PC9UYWJsZUNlbGw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+e3F1ZXN0aW9uLmRlc2NyaXB0aW9ufTwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvVGFibGVSb3c+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZUJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UYWJsZT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgICAgICAgPC9Cb3g+XG5cbiAgICAgICAgICAgICAgICB7LyogNS4gVC1TaGlydHMgVGFibGUgKi99XG4gICAgICAgICAgICAgICAgPEJveCB3aWR0aD17WzEsIDEsIDFdfSBwPVwibGdcIj5cbiAgICAgICAgICAgICAgICAgICAgPENhcmQgYXM9XCJhXCIgZmxleD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxCb3ggbWw9XCJ4bFwiIHdpZHRoPVwiMTAwJVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxIND5ULVNoaXJ0cyBvcmRlciBsaXN0PC9IND5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGU+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUhlYWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZVJvdz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVDZWxsPnRvdGFsPC9UYWJsZUNlbGw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD5zaG9ydDwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUYWJsZUNlbGw+ZGVzY3JpcHRpb248L1RhYmxlQ2VsbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvVGFibGVSb3c+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvVGFibGVIZWFkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVCb2R5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2RhdGEudHNoaXJ0cyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudHNoaXJ0cy5tYXAoKHRzaGlydCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGFibGVSb3cga2V5PXt0c2hpcnQuaWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD57dHNoaXJ0LnRvdGFsfTwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD57dHNoaXJ0LnNob3J0fTwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRhYmxlQ2VsbD57dHNoaXJ0LmRlc2NyaXB0aW9ufTwvVGFibGVDZWxsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlUm93PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlQm9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1RhYmxlPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICAgICAgICA8L0JveD4gIFxuICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgIDwvQm94PlxuICAgIClcbn1cbmV4cG9ydCBkZWZhdWx0IERhc2hib2FyZCIsImltcG9ydCB7IEJveCwgQnV0dG9uLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5pbXBvcnQgeyBCYXNlUHJvcGVydHlDb21wb25lbnQsIHVzZVRyYW5zbGF0aW9uIH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmNvbnN0IFBhc3N3b3JkRWRpdCA9IChwcm9wcykgPT4ge1xuICAgIGNvbnN0IHsgb25DaGFuZ2UsIHByb3BlcnR5LCByZWNvcmQsIHJlc291cmNlIH0gPSBwcm9wcztcbiAgICBjb25zdCB7IHRyYW5zbGF0ZUJ1dHRvbjogdGIgfSA9IHVzZVRyYW5zbGF0aW9uKCk7XG4gICAgY29uc3QgW3Nob3dQYXNzd29yZCwgdG9nZ2xlUGFzc3dvcmRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmICghc2hvd1Bhc3N3b3JkKSB7XG4gICAgICAgICAgICBvbkNoYW5nZShwcm9wZXJ0eS5uYW1lLCAnJyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25DaGFuZ2UsIHNob3dQYXNzd29yZF0pO1xuICAgIC8vIEZvciBuZXcgcmVjb3JkcyBhbHdheXMgc2hvdyB0aGUgcHJvcGVydHlcbiAgICBpZiAoIXJlY29yZC5pZCkge1xuICAgICAgICByZXR1cm4gPEJhc2VQcm9wZXJ0eUNvbXBvbmVudC5QYXNzd29yZC5FZGl0IHsuLi5wcm9wc30vPjtcbiAgICB9XG4gICAgcmV0dXJuICg8Qm94PlxuICAgICAge3Nob3dQYXNzd29yZCAmJiA8QmFzZVByb3BlcnR5Q29tcG9uZW50LlBhc3N3b3JkLkVkaXQgey4uLnByb3BzfS8+fVxuICAgICAgPEJveCBtYj1cInhsXCI+XG4gICAgICAgIDxUZXh0IHRleHRBbGlnbj1cImNlbnRlclwiPlxuICAgICAgICAgIDxCdXR0b24gb25DbGljaz17KCkgPT4gdG9nZ2xlUGFzc3dvcmQoIXNob3dQYXNzd29yZCl9IHR5cGU9XCJidXR0b25cIj5cbiAgICAgICAgICAgIHtzaG93UGFzc3dvcmQgPyB0YignY2FuY2VsJywgcmVzb3VyY2UuaWQpIDogdGIoJ2NoYW5nZVBhc3N3b3JkJywgcmVzb3VyY2UuaWQpfVxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8L1RleHQ+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD4pO1xufTtcbmV4cG9ydCBkZWZhdWx0IFBhc3N3b3JkRWRpdDtcbiIsIkFkbWluSlMuVXNlckNvbXBvbmVudHMgPSB7fVxuaW1wb3J0IExvZ2luIGZyb20gJy4uL3NyYy9jb21wb25lbnRzL0xvZ2luJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Mb2dpbiA9IExvZ2luXG5pbXBvcnQgTWVkaWFNYW5hZ2VtZW50IGZyb20gJy4uL3NyYy9jb21wb25lbnRzL01lZGlhTWFuYWdlbWVudCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuTWVkaWFNYW5hZ2VtZW50ID0gTWVkaWFNYW5hZ2VtZW50XG5pbXBvcnQgRGFzaGJvYXJkIGZyb20gJy4uL3NyYy9jb21wb25lbnRzL0Rhc2hib2FyZCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuRGFzaGJvYXJkID0gRGFzaGJvYXJkXG5pbXBvcnQgUGFzc3dvcmRFZGl0Q29tcG9uZW50IGZyb20gJy4uLy4uLy4uL25vZGVfbW9kdWxlcy9AYWRtaW5qcy9wYXNzd29yZHMvYnVpbGQvY29tcG9uZW50cy9QYXNzd29yZEVkaXRDb21wb25lbnQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlBhc3N3b3JkRWRpdENvbXBvbmVudCA9IFBhc3N3b3JkRWRpdENvbXBvbmVudCJdLCJuYW1lcyI6WyJMb2dpbiIsImV2ZW50cyIsInNldEV2ZW50cyIsInVzZVN0YXRlIiwic2VsZWN0ZWRFdmVudCIsInNldEV2ZW50IiwiaXNMb2FkaW5nIiwic2V0SXNMb2FkaW5nIiwidXNlRWZmZWN0IiwiZmV0Y2hFdmVudHMiLCJyZXNwb25zZSIsImZldGNoIiwiZGF0YSIsImpzb24iLCJjdXJyZW50RXZlbnQiLCJmaW5kIiwiZSIsImlzQ3VycmVudCIsImVycm9yIiwiY29uc29sZSIsIlJlYWN0IiwiY3JlYXRlRWxlbWVudCIsIkJveCIsIm1hcmdpbiIsImhlaWdodCIsImRpc3BsYXkiLCJmbGV4RGlyZWN0aW9uIiwiYWxpZ25JdGVtcyIsImp1c3RpZnlDb250ZW50IiwibWV0aG9kIiwiYXMiLCJIMSIsInN0eWxlIiwid2lkdGgiLCJGb3JtR3JvdXAiLCJhY3Rpb24iLCJMYWJlbCIsImh0bWxGb3IiLCJJbnB1dCIsIm5hbWUiLCJ0eXBlIiwidmFyaWFudCIsInZhbHVlIiwiU2VsZWN0Iiwib3B0aW9ucyIsIm9uQ2hhbmdlIiwiaXNEaXNhYmxlZCIsImxlbmd0aCIsIkJ1dHRvbiIsImFwaSIsIkFwaUNsaWVudCIsIkNhcmQiLCJzdHlsZWQiLCJ0aGVtZSIsImNvbG9ycyIsImdyZXkxMDAiLCJzcGFjZSIsIm1kIiwiTWVkaWFNYW5hZ2VtZW50IiwibWVkaWEiLCJzZXRNZWRpYSIsImxvYWRpbmciLCJzZXRMb2FkaW5nIiwibG9hZE1lZGlhIiwiZ2V0UGFnZSIsInBhZ2VOYW1lIiwidGhlbiIsImNhdGNoIiwicCIsIkg0IiwibWFyZ2luQm90dG9tIiwiVGV4dCIsImNvbG9yIiwiZmxleCIsImZsZXhXcmFwIiwiZ2FwIiwibWFwIiwiZmlsZSIsImlzVmlkZW8iLCJtaW1ldHlwZSIsInN0YXJ0c1dpdGgiLCJoYW5kbGVDb25maXJtVG9nZ2xlIiwiYXR0YWNobWVudElkIiwiaWQiLCJrZXkiLCJib3JkZXIiLCJjb25maXJtZWQiLCJib3JkZXJSYWRpdXMiLCJwYWRkaW5nIiwidGV4dEFsaWduIiwiYmFja2dyb3VuZENvbG9yIiwidHJhbnNpdGlvbiIsImhyZWYiLCJiYXNlNjQiLCJ0YXJnZXQiLCJyZWwiLCJ0ZXh0RGVjb3JhdGlvbiIsInNyYyIsIm9iamVjdEZpdCIsIm11dGVkIiwiYWx0IiwibWFyZ2luVG9wIiwicHJvamVjdElkIiwiY2hlY2tlZCIsInRyYW5zZm9ybSIsImN1cnNvciIsImZvbnRTaXplIiwiZm9udFdlaWdodCIsInBhZ2VIZWFkZXJIZWlnaHQiLCJwYWdlSGVhZGVyUGFkZGluZ1kiLCJwYWdlSGVhZGVyUGFkZGluZ1giLCJ5ZWFyIiwibW9udGgiLCJkYXkiLCJEYXNoYm9hcmRIZWFkZXIiLCJzZXREYXRhIiwiaXNTdWJzY3JpYmVkIiwiZ2V0RGFzaGJvYXJkIiwibG9nIiwicG9zaXRpb24iLCJvdmVyZmxvdyIsImJnIiwicHkiLCJweCIsImV2ZW50X3RpdGxlIiwib2ZmaWNpYWxTdGFydERhdGUiLCJ1bmRlZmluZWQiLCJJbnRsIiwiRGF0ZVRpbWVGb3JtYXQiLCJmb3JtYXQiLCJEYXRlIiwiZGF5c19yZW1haW5pbmciLCJwcmltYXJ5NjAiLCJzaGFkb3dzIiwiY2FyZEhvdmVyIiwiZGVmYXVsdFByb3BzIiwiYm94U2hhZG93IiwiRGFzaGJvYXJkIiwibXQiLCJtYiIsIm14IiwiYWxpZ25Db250ZW50IiwibWwiLCJwZW5kaW5nX3VzZXJzIiwib3ZlcmR1ZV9yZWdpc3RyYXRpb24iLCJ3YWl0aW5nX2xpc3QiLCJ0b3RhbF91bnVzZWRWb3VjaGVycyIsInRvdGFsX3Byb2plY3RzIiwibWF4UmVnaXN0cmF0aW9uIiwidG90YWxfdXNlZFZvdWNoZXJzIiwidG90YWxfdXNlcnMiLCJ0b3RhbF92aWRlb3MiLCJINSIsInRsYW5nX25sIiwidGxhbmdfZnIiLCJ0bGFuZ19lbiIsInRvdGFsX2ZlbWFsZXMiLCJ0b3RhbF9tYWxlcyIsInRvdGFsX1giLCJUYWJsZSIsIlRhYmxlSGVhZCIsIlRhYmxlUm93IiwiVGFibGVDZWxsIiwiVGFibGVCb2R5IiwicXVlc3Rpb25zIiwicXVlc3Rpb24iLCJ0b3RhbCIsInNob3J0IiwiZGVzY3JpcHRpb24iLCJ0c2hpcnRzIiwidHNoaXJ0IiwiUGFzc3dvcmRFZGl0IiwicHJvcHMiLCJwcm9wZXJ0eSIsInJlY29yZCIsInJlc291cmNlIiwidHJhbnNsYXRlQnV0dG9uIiwidGIiLCJ1c2VUcmFuc2xhdGlvbiIsInNob3dQYXNzd29yZCIsInRvZ2dsZVBhc3N3b3JkIiwiQmFzZVByb3BlcnR5Q29tcG9uZW50IiwiUGFzc3dvcmQiLCJFZGl0Iiwib25DbGljayIsIkFkbWluSlMiLCJVc2VyQ29tcG9uZW50cyIsIlBhc3N3b3JkRWRpdENvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztFQUFBO0VBWUEsTUFBTUEsS0FBSyxHQUFHQSxNQUFNO0lBQ2xCLE1BQU0sQ0FBQ0MsTUFBTSxFQUFFQyxTQUFTLENBQUMsR0FBR0MsY0FBUSxDQUFRLEVBQUUsQ0FBQztJQUMvQyxNQUFNLENBQUNDLGFBQWEsRUFBRUMsUUFBUSxDQUFDLEdBQUdGLGNBQVEsQ0FBTSxJQUFJLENBQUM7SUFDckQsTUFBTSxDQUFDRyxTQUFTLEVBQUVDLFlBQVksQ0FBQyxHQUFHSixjQUFRLENBQUMsSUFBSSxDQUFDO0VBRWhESyxFQUFBQSxlQUFTLENBQUMsTUFBTTtFQUNkLElBQUEsTUFB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
